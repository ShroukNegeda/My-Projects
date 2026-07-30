import { notFound } from "next/navigation";
import { featuredProjects } from "@/lib/data";
import ProjectDetailClient from "./ProjectDetailClient";

export function generateStaticParams() {
  return featuredProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = featuredProjects.find((p) => p.slug === slug);
  if (!project) return {};
  return { title: `${project.name} — Shrouk Negeda` };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = featuredProjects.find((p) => p.slug === slug);
  if (!project) notFound();

  return <ProjectDetailClient slug={slug} />;
}