import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import {
  data,
  Form,
  Link,
  redirect,
  useActionData,
  useSearchParams,
} from '@remix-run/react'
import { LoaderPinwheel } from 'lucide-react'
import { z } from 'zod'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { requireAnonymous, sessionKey, signup } from '~/lib/auth.server'
import {
  EmailSchema,
  NameSchema,
  PasswordAndConfirmPasswordSchema,
} from '~/lib/validation'
import { useIsPending } from '~/hooks/use-is-pending'
import { Button } from '~/components/ui/button'
import { ErrorList, InputField } from '~/components/ui/input-field'
import { authSessionStorage } from '~/lib/session.server'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { db } from '~/lib/db.server'

const SignupFormSchema = z
  .object({
    email: EmailSchema,
    name: NameSchema,
    redirectTo: z.string().optional(),
    inviteCode: z.string({ required_error: 'Invite code is required' }),
  })
  .and(PasswordAndConfirmPasswordSchema)

export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireAnonymous(request)
  return {}
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData()

  const submission = await parseWithZod(formData, {
    schema: intent =>
      SignupFormSchema.superRefine(async (data, ctx) => {
        const existingUser = await db.user.findUnique({
          where: { email: data.email },
          select: { id: true },
        })

        if (existingUser) {
          ctx.addIssue({
            path: ['username'],
            code: z.ZodIssueCode.custom,
            message: 'A user already exists with this username',
          })
          return
        }
      })
        .superRefine(async (data, ctx) => {
          if (data.inviteCode !== process.env.INVITE_CODE) {
            ctx.addIssue({
              path: ['inviteCode'],
              code: z.ZodIssueCode.custom,
              message: 'Please enter a valid invite code',
            })
            return
          }
        })
        .transform(async data => {
          if (intent !== null) return { ...data, session: null }

          const session = await signup(data)
          return { ...data, session }
        }),
    async: true,
  })

  if (submission.status !== 'success' || !submission.value.session) {
    return data(
      { result: submission.reply() },
      { status: submission.status === 'error' ? 400 : 200 },
    )
  }

  const { session, redirectTo } = submission.value

  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie'),
  )
  authSession.set(sessionKey, session.id)

  const headers = new Headers()

  headers.append(
    'set-cookie',
    await authSessionStorage.commitSession(authSession, {
      expires: session.expirationDate,
    }),
  )

  return redirect(safeRedirect(redirectTo), { headers })
}

export default function Signup() {
  return (
    <>
      <Button asChild variant="ghost">
        <Link
          to="/login"
          className="absolute right-4 top-4 md:right-8 md:top-8"
        >
          Login
        </Link>
      </Button>

      <div className="mx-auto flex w-full max-w-96 flex-col justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter your email below to create your account
          </p>
        </div>
        <SignupForm />
        {/* <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{' '}
              <Link
                to="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                to="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p> */}
      </div>
    </>
  )
}

function SignupForm() {
  const actionData = useActionData<typeof action>()
  const isPending = useIsPending()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const [form, fields] = useForm({
    id: 'onboarding-form',
    constraint: getZodConstraint(SignupFormSchema),
    defaultValue: { redirectTo },
    lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SignupFormSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  return (
    <div className="grid gap-6">
      <Form method="post" {...getFormProps(form)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <InputField
              labelProps={{ children: 'Name' }}
              inputProps={{
                ...getInputProps(fields.name, { type: 'text' }),
                placeholder: 'John doe',
                autoCapitalize: 'none',
                autoComplete: 'fullName',
                autoCorrect: 'off',
                disabled: isPending,
              }}
              errors={fields.name.errors}
            />
            <InputField
              labelProps={{ children: 'Email' }}
              inputProps={{
                ...getInputProps(fields.email, { type: 'email' }),
                placeholder: 'name@example.com',
                autoCapitalize: 'none',
                autoComplete: 'email',
                autoCorrect: 'off',
                disabled: isPending,
              }}
              errors={fields.email.errors}
            />

            <InputField
              labelProps={{ children: 'Password' }}
              inputProps={{
                ...getInputProps(fields.password, { type: 'password' }),
                autoCapitalize: 'none',
                autoComplete: 'newPassword',
                autoCorrect: 'off',
                disabled: isPending,
              }}
              errors={fields.password.errors}
            />
            <InputField
              labelProps={{
                children: 'Confirm Password',
              }}
              inputProps={{
                ...getInputProps(fields.confirmPassword, { type: 'password' }),
                autoCapitalize: 'none',
                autoComplete: 'confirmPassword',
                autoCorrect: 'off',
                disabled: isPending,
              }}
              errors={fields.confirmPassword.errors}
            />

            <InputField
              labelProps={{ children: 'Invite Code' }}
              inputProps={{
                ...getInputProps(fields.inviteCode, { type: 'text' }),
                placeholder: 'Invite Code',
                autoCapitalize: 'none',
                autoComplete: 'off',
                autoCorrect: 'off',
                disabled: isPending,
              }}
              errors={fields.inviteCode.errors}
            />
            <input {...getInputProps(fields.redirectTo, { type: 'hidden' })} />
            <ErrorList errors={form.errors} id={form.errorId} />
          </div>
          <Button disabled={isPending}>
            {isPending && (
              <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Account
          </Button>
        </div>
      </Form>
    </div>
  )
}
