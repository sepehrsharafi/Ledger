import { Suspense } from "react";
import { ModuleSkeleton } from "@/components/Skeleton";
import CampaignsScreen from "@/components/project-modules/CampaignsScreen";
import {
  createCampaign,
  deleteCampaign,
  updateCampaign,
} from "@/lib/actions/campaigns";
import { getProjectCampaigns } from "@/lib/data";

export default function ProjectCampaignsRoute({ params }) {
  return (
    <Suspense fallback={<ModuleSkeleton cards={4} rows={5} />}>
      <Campaigns params={params} />
    </Suspense>
  );
}

async function Campaigns({ params }) {
  const { projectId } = await params;
  const { project, campaigns } = await getProjectCampaigns(projectId);

  return (
    <CampaignsScreen
      bundle={{ project, campaigns }}
      onCreateCampaign={createCampaign}
      onUpdateCampaign={updateCampaign.bind(null, projectId)}
      onDeleteCampaign={deleteCampaign.bind(null, projectId)}
    />
  );
}
