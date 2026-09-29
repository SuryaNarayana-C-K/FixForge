import { ArrowLeft, CheckCircle2, CircleDot, Clock3, Code2, FileCheck2, Gauge, GitCommitHorizontal, Layers3, LoaderCircle, RotateCcw, ShieldCheck, TerminalSquare } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { getGetProjectQueryKey, getGetRepairQueryKey, useGetProject, useGetRepair } from '@workspace/api-client-react';
import { formatDate, PageIntro, QueryError, StatusPill } from '@/components/fixforge-ui';

export default function RepairDetail() {
  const params = useParams<{ id: string }>();
  const repairId = params.id || '';
  const repair = useGetRepair(repairId, { query: { queryKey: getGetRepairQueryKey(repairId), enabled: Boolean(repairId) } });
  const project = useGetProject(repair.data?.projectId || '', { query: { queryKey: getGetProjectQueryKey(repair.data?.projectId || ''), enabled: Boolean(repair.data?.projectId) } });
  const job = repair.data;
  if (repair.isLoading) return <DetailSkeleton />;
  if (repair.isError || !job) return <div className="mx-auto max-w-[1120px]"><QueryError message="This repair could not be found." retry={() => repair.refetch()} /></div>;
  const progress = Math.min(100, Math.max(7, Math.round((job.iteration / Math.max(job.maxIterations, 1)) * 100)));
  const finished = ['verified', 'failed', 'timeout', 'cancelled'].includes(job.status);
  const steps = ['queued', 'analyzing', 'patching', 'testing', 'verifying', 'verified'];
  const activeStep = job.status === 'self_correcting' ? 2 : steps.indexOf(job.status);
  return <div className="mx-auto max-w-[1120px]">
    <Link href="/repairs" data-testid="link-back-repairs" className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> All repairs</Link>
    <PageIntro eyebrow={`Repair ${job.id.slice(0, 12)} / execution`} title={job.issue} description={`${project.data?.name || 'Project'} · submitted ${formatDate(job.createdAt)}`} action={<StatusPill status={job.status} />} />
    <div className="grid gap-6 lg:grid-cols-[1.45fr_.75fr]">
      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center justify-between"><div><div className="ff-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">Execution state</div><h2 className="mt-1 text-lg font-semibold">{finished ? 'Run complete' : 'Forge is working'}</h2></div><div className="ff-mono text-xs text-muted-foreground">{job.iteration}/{job.maxIterations} iterations</div></div>
          <div className="mb-7 h-2 overflow-hidden rounded-full bg-secondary"><div className={`h-full rounded-full transition-all ${job.status === 'failed' ? 'bg-red-500' : 'bg-accent'}`} style={{ width: `${progress}%` }} /></div>
          <div className="relative grid grid-cols-3 gap-2 sm:grid-cols-6">{steps.map((step, index) => { const reached = index <= activeStep; const current = index === activeStep && !finished; return <div key={step} className="relative text-center"><div className={`mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-full border-2 ${reached ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-card text-muted-foreground'} ${current ? 'ring-4 ring-accent/15' : ''}`}>{reached ? <CheckCircle2 size={13} /> : <span className="ff-mono text-[10px]">{index + 1}</span>}</div><div className={`text-[10px] capitalize ${reached ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{step.replace('_', ' ')}</div></div> })}</div>
        </section>
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-2"><TerminalSquare size={17} className="text-accent-foreground" /><h2 className="text-base font-semibold">Execution evidence</h2></div>
          <div className="space-y-0">{['Repository snapshot created', 'Failure analyzed and context indexed', 'Patch candidates generated', 'Test suite executed', finished ? 'Verification completed' : 'Awaiting verification result'].map((event, index) => <div key={event} className="flex gap-3 border-b border-border/70 py-3.5 last:border-0"><div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-md ${index < activeStep || finished ? 'bg-emerald-100 text-emerald-700' : index === activeStep ? 'bg-accent/20 text-accent-foreground' : 'bg-secondary text-muted-foreground'}`}>{index < activeStep || finished ? <CheckCircle2 size={13} /> : index === activeStep ? <LoaderCircle size={13} className="animate-spin" /> : <CircleDot size={13} />}</div><div className="flex-1"><div className="text-xs font-medium">{event}</div><div className="mt-1 ff-mono text-[10px] text-muted-foreground">{index <= activeStep ? (index === activeStep && !finished ? 'in progress' : 'recorded') : 'pending'}</div></div><div className="ff-mono text-[10px] text-muted-foreground">{index <= activeStep ? 'now' : '—'}</div></div>)}</div>
        </section>
      </div>
      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-5"><div className="mb-4 ff-mono text-[10px] uppercase tracking-[.2em] text-muted-foreground">Run profile</div><div className="space-y-4"><Info icon={<Code2 size={15} />} label="Model" value={job.model} /><Info icon={<ShieldCheck size={15} />} label="Verification" value={job.verificationLevel} /><Info icon={<Layers3 size={15} />} label="Iteration budget" value={`${job.maxIterations} max`} /><Info icon={<GitCommitHorizontal size={15} />} label="Project" value={project.data?.name || job.projectId.slice(0, 12)} /></div></section>
        <section className="rounded-xl border border-border bg-card p-5"><div className="mb-4 flex items-center gap-2"><FileCheck2 size={16} className="text-accent-foreground" /><h2 className="text-sm font-semibold">Test verification</h2></div><div className="mb-3 flex items-end justify-between"><span className="text-2xl font-semibold tracking-tight">{job.testsPassed}<span className="text-sm font-normal text-muted-foreground">/{job.testsTotal} passing</span></span><span className="ff-mono text-[10px] text-muted-foreground">{job.testsTotal ? Math.round((job.testsPassed / job.testsTotal) * 100) : 0}%</span></div><div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${job.testsTotal ? (job.testsPassed / job.testsTotal) * 100 : 0}%` }} /></div></section>
        <Link href={project.data ? `/projects/${project.data.id}` : '/'} data-testid="link-detail-project" className="flex items-center justify-between rounded-xl border border-border bg-primary p-5 text-primary-foreground hover:-translate-y-px"><div><div className="ff-mono text-[10px] uppercase tracking-[.18em] text-primary-foreground/50">Project context</div><div className="mt-1 text-sm font-semibold">{project.data?.name || 'Open project'}</div></div><ArrowLeft size={16} className="rotate-180 text-accent" /></Link>
      </div>
    </div>
  </div>;
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="flex items-center gap-3"><div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-muted-foreground">{icon}</div><span className="flex-1 text-xs text-muted-foreground">{label}</span><span className="ff-mono text-[10px] font-medium text-foreground">{value}</span></div>; }
function DetailSkeleton() { return <div className="mx-auto max-w-[1120px]"><div className="ff-skeleton mb-7 h-4 w-24 rounded" /><div className="ff-skeleton mb-8 h-20 w-3/4 rounded" /><div className="grid gap-6 lg:grid-cols-[1.45fr_.75fr]"><div className="ff-skeleton h-80 rounded-xl" /><div className="ff-skeleton h-56 rounded-xl" /></div></div>; }