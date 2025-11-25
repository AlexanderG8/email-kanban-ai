"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { KPICard } from "@/components/analytics/KPICard";
import { TaskDistributionChart } from "@/components/analytics/TaskDistributionChart";
import { TasksByPriorityChart } from "@/components/analytics/TasksByPriorityChart";
import { CompletionTimelineChart } from "@/components/analytics/CompletionTimelineChart";
import { EmailsByCategoryChart } from "@/components/analytics/EmailsByCategoryChart";
import { ProductivityHeatmap } from "@/components/analytics/ProductivityHeatmap";
import { TopSendersTable } from "@/components/analytics/TopSendersTable";
import { UpcomingTasksTable } from "@/components/analytics/UpcomingTasksTable";
import { DetailPanel } from "@/components/panel/DetailPanel";
import { CheckCircle2, Clock, Mail, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";
import type {
  OverviewMetrics,
  TaskDistribution,
  TimelineData,
  EmailsByCategoryData,
  TopSender,
  UpcomingTask,
  HeatmapData,
} from "@/types/analytics";

export default function AnalisisPage() {
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [distribution, setDistribution] = useState<TaskDistribution | null>(null);
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [emailsCategory, setEmailsCategory] = useState<EmailsByCategoryData[]>([]);
  const [topSenders, setTopSenders] = useState<TopSender[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedTaskId = useStore((state) => state.selectedTaskId);
  const setSelectedTaskId = useStore((state) => state.setSelectedTaskId);
  const setIsPanelOpen = useStore((state) => state.setIsPanelOpen);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [
        overviewRes,
        distributionRes,
        timelineRes,
        emailsCategoryRes,
        topSendersRes,
        upcomingTasksRes,
        heatmapRes,
      ] = await Promise.all([
        fetch("/api/analytics/overview"),
        fetch("/api/analytics/tasks-distribution"),
        fetch("/api/analytics/timeline?days=30"),
        fetch("/api/analytics/emails-category?days=30"),
        fetch("/api/analytics/top-senders?limit=10"),
        fetch("/api/analytics/upcoming-tasks?daysAhead=7"),
        fetch("/api/analytics/productivity-heatmap?days=30"),
      ]);

      if (
        !overviewRes.ok ||
        !distributionRes.ok ||
        !timelineRes.ok ||
        !emailsCategoryRes.ok ||
        !topSendersRes.ok ||
        !upcomingTasksRes.ok ||
        !heatmapRes.ok
      ) {
        throw new Error("Error al cargar datos de analytics");
      }

      const [
        overviewData,
        distributionData,
        timelineData,
        emailsCategoryData,
        topSendersData,
        upcomingTasksData,
        heatmapData,
      ] = await Promise.all([
        overviewRes.json(),
        distributionRes.json(),
        timelineRes.json(),
        emailsCategoryRes.json(),
        topSendersRes.json(),
        upcomingTasksRes.json(),
        heatmapRes.json(),
      ]);

      setOverview(overviewData);
      setDistribution(distributionData);
      setTimeline(timelineData.timeline);
      setEmailsCategory(emailsCategoryData.timeline);
      setTopSenders(topSendersData.senders);
      setUpcomingTasks(upcomingTasksData.tasks);
      setHeatmap(heatmapData.heatmap);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Error al cargar datos de analytics");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsPanelOpen(true);
  };

  const handleCloseDetailPanel = () => {
    setSelectedTaskId(null);
    setIsPanelOpen(false);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Analisis</h1>
          <p className="text-muted-foreground">
            Visualiza metricas y estadisticas de tus tareas y emails
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {/* KPI Skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-[140px] border rounded-lg animate-pulse bg-gray-100 dark:bg-gray-800"
                />
              ))}
            </div>

            {/* Charts Skeletons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-[400px] border rounded-lg animate-pulse bg-gray-100 dark:bg-gray-800"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards */}
            {overview && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                  title="Tareas Activas"
                  value={overview.activeTasks}
                  trend={overview.trends.activeTasks}
                  icon={Clock}
                />
                <KPICard
                  title="Tasa de Completacion"
                  value={overview.completionRate}
                  suffix="%"
                  trend={overview.trends.completionRate}
                  icon={CheckCircle2}
                />
                <KPICard
                  title="Emails Hoy"
                  value={overview.emailsToday}
                  trend={overview.trends.emailsToday}
                  icon={Mail}
                />
                <KPICard
                  title="Tiempo Promedio"
                  value={overview.avgResolutionTime.toFixed(1)}
                  suffix="hrs"
                  icon={TrendingUp}
                  trendLabel="de resolucion"
                />
              </div>
            )}

            {/* First Row of Charts */}
            {distribution && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TaskDistributionChart data={distribution.byStatus} />
                <TasksByPriorityChart data={distribution.byPriority} />
              </div>
            )}

            {/* Second Row of Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CompletionTimelineChart data={timeline} />
              <EmailsByCategoryChart data={emailsCategory} />
            </div>

            {/* Heatmap - Full Width */}
            <ProductivityHeatmap data={heatmap} />

            {/* Insight Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopSendersTable data={topSenders} />
              <UpcomingTasksTable
                data={upcomingTasks}
                onTaskClick={handleTaskClick}
              />
            </div>

            {/* Empty State */}
            {!overview && !distribution && (
              <div className="text-center py-12 border rounded-lg">
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  No hay datos disponibles
                </h3>
                <p className="text-muted-foreground">
                  Comienza importando emails y creando tareas para ver tus
                  estadisticas.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Detail Panel */}
      <DetailPanel taskId={selectedTaskId} onClose={handleCloseDetailPanel} />
    </>
  );
}
