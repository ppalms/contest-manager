import { useEffect, useState } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import { getDatePickerValue } from '@/helpers';

export interface TextInputProps {
  label: string;
  type: string;
  inputName: string;
  inputValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validate?: (value: string) => string | null;
}

export default function TextInput(props: TextInputProps) {
  const { label, type, inputName, inputValue, onChange, validate } = props;

  const [value, setValue] = useState<string>(inputValue);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (type === 'date') {
      setValue(getDatePickerValue(inputValue));
    } else {
      setValue(inputValue);
    }

    if (inputValue.length > 0) {
      setTouched(true);
    }
  }, [inputValue, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validate) {
      const newValue = e.target.value;
      if (touched || e.type == 'blur') {
        const errorMessage = validate(newValue);
        setError(errorMessage);
      }
    }

    // Run provided onChange handler
    onChange(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    handleChange(e);
    setTouched(true);
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
          className={`placeholder-gray-300 block w-full rounded-md border-0 py-1.5 pr-10 ring-1 ring-inset focus:ring-2 focus:ring-neutral-600 focus:ring-inset sm:text-sm sm:leading-6 disabled:ring-0 disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-300 ${
            error ? 'ring-red-300 text-red-900 focus:ring-red-500' : ''
          }`}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={Boolean(error)}
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
