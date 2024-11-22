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

const SignalFormSchema = z.object({
  name: z.string(),
  description: z.string(),
  // label: z.string().optional(),
  // type: z.string(),
  exchange: z.enum(['NSE', 'BSE']),
  symbol: z.string(),
  // targetStopLossType: z.string(),
  takeProfitValue: z.number(),
  stopLossValue: z.number(),
  allocatedFund: z.number(),
  size: z.number(), //order size
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
    allocatedFund,
    size,
  } = submission.value

  const { data: token, error } = await getToken({
    userId,
    brokerAccountId: brokerAccounts[0],
  })

  if (error || !token) {
    return data(
      {
        result: submission.reply({
          formErrors: ['Please relogin with your broker account first.'],
        }),
      },
      { status: 400 },
    )
  }

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
      targetStopLossType: 'POINTS',
      takeProfitValue,
      userId,
      allocatedFund,
      size,
      brokerAccounts: {
        connect: brokerAccounts.map(id => ({ id })),
      },
    },
  })

  return redirect('/dashboard/signals')
}

export default function TradeSignals() {
  const { signal, exchangeOptions, brokerAccounts } =
    useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const isPending = useIsPending()
  console.log('🚀 ~ TradeSignals ~ actionData:', actionData)

  const [form, fields] = useForm({
    id: 'onboarding-form',
    constraint: getZodConstraint(SignalFormSchema),
    defaultValue: { exchange: 'BSE' },
    lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SignalFormSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  const exchangeSelectControl = useInputControl(fields.exchange)
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
              exchange="NSE"
              value={symbolSelectControl.value}
              setValue={symbolSelectControl.change}
            />
          </FormField>
          <InputField
            labelProps={{ children: 'Allocated Fund' }}
            inputProps={{
              ...getInputProps(fields.allocatedFund, { type: 'number' }),
              autoCapitalize: 'none',
            }}
            errors={fields.allocatedFund.errors}
          />
          <InputField
            labelProps={{ children: 'Order Size' }}
            inputProps={{
              ...getInputProps(fields.size, { type: 'number' }),
              autoCapitalize: 'none',
            }}
            errors={fields.size.errors}
          />
          <InputField
            labelProps={{ children: 'Stop Loss (Points)' }}
            inputProps={{
              ...getInputProps(fields.stopLossValue, { type: 'number' }),
              autoCapitalize: 'none',
            }}
            errors={fields.stopLossValue.errors}
          />
          <InputField
            labelProps={{ children: 'Take Profit (Points)' }}
            inputProps={{
              ...getInputProps(fields.takeProfitValue, { type: 'number' }),
              autoCapitalize: 'none',
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
