import { BinDetailView } from "@/components/dashboard/bin-detail-view";

type BinDetailPageProps = {
  params: Promise<{
    binId: string;
  }>;
};

export default async function BinDetailPage({ params }: BinDetailPageProps) {
  const { binId } = await params;

  return <BinDetailView binId={binId} />;
}
