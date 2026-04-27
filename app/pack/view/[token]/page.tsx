import PackViewClient from "./PackViewClient";

export default async function PackViewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <PackViewClient token={token} />;
}
