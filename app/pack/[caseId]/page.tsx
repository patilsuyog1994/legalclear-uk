import PackPageClient from "./PackPageClient";

export default async function PackPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return <PackPageClient caseId={caseId} />;
}
