import { RoleGuard } from "@/components/auth/role-guard";
import { BinDetailView } from "@/components/dashboard/bin-detail-view";

type BinDetailPageProps = {
  params: Promise<{
    binId: string;
  }>;
};

export default async function BinDetailPage({ params }: BinDetailPageProps) {
  const { binId } = await params;

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <BinDetailView binId={binId} />
    </RoleGuard>
  );
}
