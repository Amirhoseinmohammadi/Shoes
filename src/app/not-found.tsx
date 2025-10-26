import { notFound } from "next/navigation";

export default function Page() {
  const someCondition = false;

  if (!someCondition) notFound();

  return <div>این صفحه وجود دارد</div>;
}
