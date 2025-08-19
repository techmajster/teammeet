export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            
            <h2 className="mt-4 text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Authentication Error
            </h2>
            
            <p className="mt-2 text-sm text-gray-600">
              Sorry, we couldn&apos;t sign you in. This could be due to:
            </p>
            
            <ul className="mt-4 text-left text-sm text-gray-600 space-y-1">
              <li>• An expired or invalid authentication code</li>
              <li>• A network connection issue</li>
              <li>• Configuration problems with the authentication provider</li>
            </ul>
            
            <div className="mt-6 flex items-center justify-center gap-x-6">
              <a
                href="/auth/login"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Try Again
              </a>
              <a
                href="/"
                className="text-sm font-semibold text-gray-900"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}