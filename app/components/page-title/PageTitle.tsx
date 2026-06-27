export const PageTitle = ({ title }: { title: string }) => {
  return (
    <div className="flex items-center gap-4 py-6">
      <div className="flex-1">
        <div className="h-px bg-linear-to-l from-white to-transparent w-full" />
      </div>
      <h1 className="text-2xl leading-none font-semibold text-white">
        {title}
      </h1>
      <div className="flex-1">
        <div className="h-px bg-linear-to-r from-white to-transparent w-full" />
      </div>
    </div>
  );
};
