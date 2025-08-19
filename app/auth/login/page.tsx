import LoginButton from '@/components/auth/login-button'

// Force dynamic rendering to prevent static generation issues with Supabase
export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          TeamMeet
        </h1>
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in with your @bb8.pl company account
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <div className="flex justify-center">
            <LoginButton />
          </div>
          
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  Company authentication with Google Workspace
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                🏢 Only @bb8.pl company emails are allowed
              </p>
              <p className="text-xs text-gray-500">
                Contact your administrator if you need access
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}