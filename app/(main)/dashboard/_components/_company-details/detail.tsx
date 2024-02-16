type DetailProps = {
  label: string;
  value: string;
};

export const Detail: React.FC<DetailProps> = ({ label, value }) => {
  return (
    <div className="mb-4">
      <p className="text-sm text-gray-500 dark:text-slate-100">{label}</p>
      <p className="font-medium text-gray-700 dark:text-slate-400">{value}</p>
    </div>
  );
};
