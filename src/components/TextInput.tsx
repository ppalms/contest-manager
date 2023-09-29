import { useEffect, useState } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';

export interface TextInputProps {
  label: string;
  type: string;
  inputName: string;
  inputValue: string;
  validate?: (s: string) => string | null;
}

export default function TextInput(props: TextInputProps) {
  const { label, type, inputName, inputValue, validate } = props;

  const [value, setValue] = useState<string>(inputValue);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(inputValue);
    if (inputValue.length > 0) {
      setTouched(true);
    }
  }, [inputValue]);

  const handleChange = (e: { target: { value: any }; type: string }) => {
    // TODO don't do anything if user clicked cancel

    const newValue = e.target.value;
    setValue(newValue);

    // No validation function was provided
    if (!validate) return;

    if (touched || e.type == 'blur') {
      const errorMessage = validate(newValue);
      setError(errorMessage);
    }
  };

  return (
    <div>
      <label
        htmlFor={inputName}
        className="block text-sm font-medium leading-6 text-gray-900">
        {label}
      </label>
      <div className="relative mt-2 rounded-md shadow-sm">
        <input
          type={type}
          name={inputName}
          id={inputName}
          className={`block w-full rounded-md border-0 py-1.5 pr-10 ring-1 disabled:ring-0 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-300 ${
            error ? 'ring-red-300 text-red-900 focus:ring-red-500' : ''
          }`}
          value={value}
          onChange={handleChange}
          onBlur={(e) => {
            handleChange(e);
            setTouched(true);
          }}
          aria-invalid={(error && error.length > 0) || false}
          aria-describedby="input-error"
        />
        {error ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
            />
          </div>
        ) : null}
      </div>
      {error ? (
        <p className="mt-2 text-sm text-red-600" id="input-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
