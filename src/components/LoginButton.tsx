export interface LoginButtonProps {
  buttonText: string;
  disabled: boolean;
  loading: boolean;
}

const LoginButton = (props: LoginButtonProps) => {
  return (
    <div>
      <button
        type="submit"
        disabled={props.disabled}
        className="relative flex w-full justify-center items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300 disabled:hover:bg-indigo-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
        {props.loading ? (
          <>
            {props.buttonText}
            <svg
              className="absolute right-3 animate-spin -mr-0.5 ml-2 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </>
        ) : (
          <>{props.buttonText}</>
        )}
      </button>
    </div>
  );
};

export default LoginButton;
