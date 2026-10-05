import { Suspense } from 'react';
import { PageLoader } from '@/components/ui';
import { ProjectsPage } from '@/views/ProjectsPage';

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProjectsPage />
    </Suspense>
  );
}
