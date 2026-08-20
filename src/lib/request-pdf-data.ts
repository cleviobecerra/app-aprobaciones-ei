import { requestPdfFileName } from "@/lib/labels";

export type RequestPdfPayload = {
  title: string;
  description: string;
  status: string;
  createdByName: string;
  createdAt: string;
  completedAt: string | null;
  fileName: string;
  currentStage: number;
  auditEvents: {
    id: string;
    actorName: string;
    actorEmail: string;
    action: string;
    detail: string;
    createdAt: string;
  }[];
  stages: {
    id: string;
    order: number;
    name: string;
    mode: string;
    tasks: {
      id: string;
      status: string;
      comment: string;
      actedAt: string | null;
      email: string;
      name: string;
    }[];
  }[];
};

export function toRequestPdfPayload(request: {
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
  currentStage: number;
  createdBy: { name: string };
  auditEvents: {
    id: string;
    actorName: string;
    actorEmail: string;
    action: string;
    detail: string;
    createdAt: Date;
  }[];
  stages: {
    id: string;
    order: number;
    name: string;
    mode: string;
    tasks: {
      id: string;
      status: string;
      comment: string;
      actedAt: Date | null;
      email: string;
      name: string;
    }[];
  }[];
}): RequestPdfPayload {
  return {
    title: request.title,
    description: request.description,
    status: request.status,
    createdByName: request.createdBy.name,
    createdAt: request.createdAt.toISOString(),
    completedAt: request.completedAt?.toISOString() ?? null,
    fileName: requestPdfFileName(request.title),
    currentStage: request.currentStage,
    auditEvents: request.auditEvents.map((event) => ({
      id: event.id,
      actorName: event.actorName,
      actorEmail: event.actorEmail,
      action: event.action,
      detail: event.detail,
      createdAt: event.createdAt.toISOString(),
    })),
    stages: request.stages.map((stage) => ({
      id: stage.id,
      order: stage.order,
      name: stage.name,
      mode: stage.mode,
      tasks: stage.tasks.map((task) => ({
        id: task.id,
        status: task.status,
        comment: task.comment,
        actedAt: task.actedAt?.toISOString() ?? null,
        email: task.email,
        name: task.name,
      })),
    })),
  };
}
