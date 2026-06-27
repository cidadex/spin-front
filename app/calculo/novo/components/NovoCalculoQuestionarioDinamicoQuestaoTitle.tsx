
export const NovoCalculoQuestionarioDinamicoQuestaoTitle = ({
  title,
  subtitle,
  crime,
}: {
  title: string;
  subtitle: string | null;
  crime: {
    codigo: string;
    descricao: string;
  };
}) => {
  return (
    <>
      <h1 className="font-bold text-2xl leading-none text-center">{title}</h1>
      <div className="text-center text-sm max-w-3xl leading-none mt-4">
        {subtitle?.split("\n").map((line, index) => (
          <p key={index} className="pb-2">
            {line}
          </p>
        ))}
      </div>
      <Activity mode={crime.codigo || crime.descricao ? "visible" : "hidden"}>
        <span className="text-center text-sm leading-none mt-2">
          {crime.codigo} {crime.descricao}
        </span>
      </Activity>
    </>
  );
};
import { Activity } from "@/components/ui/activity";
