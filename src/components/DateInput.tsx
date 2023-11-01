import TextInput from './TextInput';
import { useEffect, useState } from 'react';

interface DateInputProps {
  label: string;
  inputName: string;
  utcValue: string;
  onDateChange: (newUtcDate: string) => void;
  validate?: (value: string) => string | null;
}

export default function DateInput(props: DateInputProps) {
  const { utcValue, onDateChange, ...other } = props;

  const [localDate, setLocalDate] = useState(() => {
    const dateObj = new Date(utcValue);
    if (dateObj.toString() === 'Invalid Date') {
      return '';
    }

    // Format as YYYY-MM-DD for the input
    return dateObj.toISOString().slice(0, 10);
  });

  useEffect(() => {
    const dateObj = new Date(utcValue);
    if (dateObj.toString() === 'Invalid Date') {
      setLocalDate('');
      return;
    }

    setLocalDate(dateObj.toISOString().slice(0, 10));
  }, [utcValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = toUTCDate(e.target.value);
    if (!selectedDate) {
      onDateChange('');
      return;
    }

    onDateChange(selectedDate.toISOString());
  };

  const toUTCDate = (localDateStr: string) => {
    if (!localDateStr || localDateStr.length === 0) {
      return undefined;
    }

    const localDate = new Date(localDateStr);
    return new Date(
      localDate.getUTCFullYear(),
      localDate.getUTCMonth(),
      localDate.getUTCDate()
    );
  };

  return (
    <TextInput
      {...other}
      inputValue={localDate}
      onChange={handleChange}
      type="date"
    />
  );
}
