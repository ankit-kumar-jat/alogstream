import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { data, redirect } from '@remix-run/node'
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react'
import { z } from 'zod'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { login, requireAnonymous, sessionKey } from '~/lib/auth.server'
import { EmailSchema, PasswordSchema } from '~/lib/validation'
import { useIsPending } from '~/hooks/use-is-pending'
import { Button } from '~/components/ui/button'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { authSessionStorage } from '~/lib/session.server'
import { ErrorList, InputField } from '~/components/ui/input-field'

const LoginFormSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  redirectTo: z.string().optional(),
})

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request)
  return {}
}

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData()

  await requireAnonymous(request)

  const submission = await parseWithZod(formData, {
    schema: intent =>
      LoginFormSchema.transform(async (data, ctx) => {
        if (intent !== null) return { ...data, session: null }

        const session = await login(data)
        if (!session) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid username or password',
          })
          return z.NEVER
        }

        return { ...data, session }
      }),
    async: true,
  })

  if (submission.status !== 'success' || !submission.value.session) {
    return data(
      { result: submission.reply({ hideFields: ['password'] }) },
      { status: submission.status === 'error' ? 400 : 200 },
    )
  }

  const { session, redirectTo } = submission.value

  const authSession = await authSessionStorage.getSession(
    request.headers.get('cookie'),
  )
  authSession.set(sessionKey, session.id)

  return redirect(safeRedirect(redirectTo, '/dashboard'), {
    headers: {
      'set-cookie': await authSessionStorage.commitSession(authSession, {
        expires: session.expirationDate,
      }),
    },
  })
}

export default function Login() {
  return (
    <>
      <Button asChild variant="ghost">
        <Link
          to="/signup"
          className="absolute right-4 top-4 md:right-8 md:top-8"
        >
          Sign Up
        </Link>
      </Button>

      <div className="mx-auto flex w-full max-w-96 flex-col justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email below to login
          </p>
        </div>
        <LoginForm />
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

function LoginForm() {
  const actionData = useActionData<typeof action>()
  const isPending = useIsPending()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const [form, fields] = useForm({
    id: 'onboarding-form',
    constraint: getZodConstraint(LoginFormSchema),
    defaultValue: { redirectTo },
    lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LoginFormSchema })
    },
    shouldRevalidate: 'onBlur',
  })
  return (
    <div className="grid gap-6">
      <Form method="post" {...getFormProps(form)}>
        <div className="grid gap-4">
          <div className="grid gap-1">
            <InputField
              labelProps={{ children: 'Email' }}
              inputProps={{
                ...getInputProps(fields.email, { type: 'email' }),
                placeholder: 'name@example.com',
                autoCapitalize: 'none',
                autoComplete: 'username',
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
                autoComplete: 'current-password',
                autoCorrect: 'off',
                disabled: isPending,
              }}
              errors={fields.password.errors}
            />
            <input {...getInputProps(fields.redirectTo, { type: 'hidden' })} />
            <ErrorList errors={form.errors} id={form.errorId} />
          </div>
          <Button disabled={isPending}>Login with Password</Button>
        </div>
      </Form>
    </div>
  )
}
