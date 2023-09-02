import { classNames } from '@/helpers';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';

export interface TextInputProps {
  label: string;
  type: string;
  inputName: string;
  defaultValue?: string | undefined;
  errorMessage?: string | undefined;
}

export default function TextInput(props: TextInputProps) {
  if (props.errorMessage && props.errorMessage.length < 3) {
    throw new Error('Error message must be at least 3 characters');
  }

  return (
    <div>
      <label
        htmlFor={props.inputName}
        className="block text-sm font-medium leading-6 text-gray-900">
        {props.label}
      </label>
      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
        <input
          type={props.type}
          name={props.inputName}
          id={props.inputName}
          className={classNames(
            props.errorMessage
              ? 'text-red-900  ring-red-300 placeholder:text-red-300  focus:ring-red-500'
              : 'text-gray-900',
            'block flex-1 border-0 bg-transparent py-1.5 pl-1 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6'
          )}
          defaultValue={props.defaultValue}
          aria-invalid="true"
          aria-describedby="input-error"
        />
        {props.errorMessage ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
            />
          </div>
        ) : null}
      </div>
      {props.errorMessage ? (
        <p className="mt-2 text-sm text-red-600" id="input-error">
          Not a valid email address.
        </p>
      ) : null}
    </div>
  );
}
