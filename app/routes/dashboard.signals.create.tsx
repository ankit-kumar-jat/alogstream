import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node'
import { data, redirect } from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
  getFieldsetProps,
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
  useInputControl,
} from '@conform-to/react'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { useIsPending } from '~/hooks/use-is-pending'
import { requireUserId } from '~/lib/auth.server'
import { db } from '~/lib/db.server'
import {
  ErrorList,
  FormField,
  InputField,
  TextareaField,
} from '~/components/ui/input-field'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { getToken } from '~/lib/broker/angleone.server'
import { getSymbolToken } from '~/lib/broker/order.server'
import { InstrumentSelect } from './resources.search-instrument'
import { Exchange } from '~/types/angleone'

const SignalFormSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  // label: z.string().optional(),
  exchange: z.enum(['NSE', 'BSE', 'NFO']),
  symbol: z.string(),
  targetStopLossType: z.enum(['POINTS', 'PERCENTAGE']),
  takeProfitValue: z.number().gt(0),
  stopLossValue: z.number().gt(0),
  // allocatedFund: z.number().gt(0),
  size: z.number().gt(0), // order-size/lots
  brokerAccounts: z.array(z.string().cuid2()),
})

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request)
  const url = new URL(request.url)

  const signalId = url.searchParams.get('id')

  let signal = null

  if (signalId && typeof signalId === 'string') {
    signal = await db.signal.findUnique({
      where: { userId, id: signalId },
    })
  }

  const brokerAccounts = await db.brokerAccount.findMany({
    where: { userId },
    select: { id: true, clientName: true, clientId: true },
  })

  const exchangeOptions = [
    { title: 'NSE', value: 'NSE' },
    { title: 'BSE', value: 'BSE' },
    // { title: 'NFO', value: 'NFO' },
  ]

  const slTypeOptions = [
    { title: 'Points', value: 'POINTS' },
    { title: 'Percentage', value: 'PERCENTAGE' },
  ]

  return {
    signal: signal
      ? {
          ...signal,
          allocatedFund: signal.allocatedFund.toString(),
          takeProfitValue: signal.takeProfitValue.toString(),
          stopLossValue: signal.stopLossValue.toString(),
        }
      : null,
    brokerAccounts,
    exchangeOptions,
    slTypeOptions,
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request)
  const formData = await request.formData()

  const submission = await parseWithZod(formData, {
    schema: SignalFormSchema,
    async: true,
  })

  if (submission.status !== 'success') {
    return data({ result: submission.reply() }, { status: 400 })
  }

  const {
    name,
    description,
    symbol,
    stopLossValue,
    brokerAccounts,
    takeProfitValue,
    targetStopLossType,
    size,
  } = submission.value

  const symbolDetails = await db.instrument.findUnique({
    where: { token: symbol },
  })

  if (!symbolDetails) {
    return data(
      {
        result: submission.reply({
          formErrors: ['Unable to fetch symbol data.'],
        }),
      },
      { status: 400 },
    )
  }

  await db.signal.create({
    data: {
      name,
      description,
      exchange: symbolDetails.exchange,
      tickerSymbol: symbolDetails.symbol,
      tickerSymbolToken: symbolDetails.token,
      type: 'INTRADAY',
      stopLossValue,
      targetStopLossType,
      takeProfitValue,
      userId,
      allocatedFund: 0,
      size,
      brokerAccounts: {
        connect: brokerAccounts.map(id => ({ id })),
      },
    },
  })

  return redirect('/dashboard/signals')
}

export default function TradeSignals() {
  const { signal, exchangeOptions, brokerAccounts, slTypeOptions } =
    useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const isPending = useIsPending()

  const [form, fields] = useForm({
    id: 'onboarding-form',
    constraint: getZodConstraint(SignalFormSchema),
    defaultValue: { exchange: 'NSE', targetStopLossType: 'POINTS' },
    lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SignalFormSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  const exchangeSelectControl = useInputControl(fields.exchange)
  const slTypeSelectControl = useInputControl(fields.targetStopLossType)
  const symbolSelectControl = useInputControl(fields.symbol)

  return (
    <div className="container mx-auto my-10 max-w-3xl space-y-4 px-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-lg font-bold md:text-xl">New Signals</h1>
      </div>

      <div>
        <Form
          method="post"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          {...getFormProps(form)}
        >
          <InputField
            labelProps={{ children: 'Signal Name' }}
            inputProps={{
              ...getInputProps(fields.name, { type: 'text' }),
              autoCapitalize: 'none',
            }}
            errors={fields.name.errors}
          />
          <FormField
            labelProps={{ children: 'Exchange' }}
            errors={fields.exchange.errors}
            inputId={fields.exchange.id}
          >
            <Select
              onValueChange={exchangeSelectControl.change}
              defaultValue={exchangeSelectControl.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Exchange" />
              </SelectTrigger>

              <SelectContent>
                {exchangeOptions.map(exchange => (
                  <SelectItem value={exchange.value} key={exchange.title}>
                    {exchange.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField
            labelProps={{ children: 'Stock Symbol' }}
            errors={fields.symbol.errors}
            inputId={fields.symbol.id}
          >
            <InstrumentSelect
              exchange={fields.exchange.value as Exchange}
              value={symbolSelectControl.value}
              setValue={symbolSelectControl.change}
            />
          </FormField>
          <InputField
            labelProps={{ children: 'Order Size (Lots)' }}
            inputProps={{
              ...getInputProps(fields.size, { type: 'number' }),
              autoCapitalize: 'none',
            }}
            errors={fields.size.errors}
          />
          <FormField
            labelProps={{ children: 'SL Type' }}
            errors={fields.targetStopLossType.errors}
            inputId={fields.targetStopLossType.id}
          >
            <Select
              onValueChange={slTypeSelectControl.change}
              defaultValue={slTypeSelectControl.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select SL Type" />
              </SelectTrigger>

              <SelectContent>
                {slTypeOptions.map(slType => (
                  <SelectItem value={slType.value} key={slType.title}>
                    {slType.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <InputField
            labelProps={{
              children: `Stop Loss (${slTypeSelectControl.value?.toLowerCase()})`,
              className: 'capitalize',
            }}
            inputProps={{
              ...getInputProps(fields.stopLossValue, { type: 'number' }),
              autoCapitalize: 'none',
              step: 0.1,
            }}
            errors={fields.stopLossValue.errors}
          />
          <InputField
            labelProps={{
              children: `Take Profit (${slTypeSelectControl.value?.toLowerCase()})`,
            }}
            inputProps={{
              ...getInputProps(fields.takeProfitValue, { type: 'number' }),
              autoCapitalize: 'none',
              step: 0.1,
            }}
            errors={fields.takeProfitValue.errors}
          />

          <TextareaField
            labelProps={{ children: 'Description' }}
            textareaProps={{
              ...getTextareaProps(fields.description),
              autoCapitalize: 'none',
            }}
            errors={fields.description.errors}
          />

          <div>
            <fieldset {...getFieldsetProps(fields.brokerAccounts)}>
              <legend>Please select broker Accounts</legend>
              <div>
                {brokerAccounts.map(brokerAccount => (
                  <div
                    key={brokerAccount.id}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      name={fields.brokerAccounts.name}
                      value={brokerAccount.id}
                      id={brokerAccount.id}
                      defaultChecked={
                        fields.brokerAccounts.initialValue &&
                        Array.isArray(fields.brokerAccounts.initialValue)
                          ? fields.brokerAccounts.initialValue.includes(
                              brokerAccount.id,
                            )
                          : fields.brokerAccounts.initialValue ===
                            brokerAccount.id
                      }
                    />
                    <label htmlFor={brokerAccount.id}>
                      {brokerAccount.clientName} - {brokerAccount.clientId}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
            <ErrorList errors={fields.brokerAccounts.errors} />
          </div>
          <div className="sm:col-span-2">
            <ErrorList errors={form.errors} id={form.errorId} />
            <Button disabled={isPending}>Create</Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
