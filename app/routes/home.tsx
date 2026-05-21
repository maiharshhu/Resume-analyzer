import Navbar from "~/component/Navbar";
import type { Route } from "./+types/home";
import { resumes } from "~/constants";
import { resume } from "react-dom/server";
import ResumeCard from "~/component/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) navigate('/auth?/next=/')
  }, [auth.isAuthenticated])


  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      const resumes = (await kv.list('resume:*', true)) as KVitem[];

      const parsedResume = resumes?.map((resume) => (
        JSON.parse(resume.value) as Resume
      ))

      setResumes(parsedResume || []);
      setLoadingResumes(false);
    }
    loadResumes()
  }, []);


  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar />
    <section className="main-section">
      <div className="page-heading py-16">
        <h1>Track Your Application & Resume Ratings</h1>
        {!loadingResumes && resume?.length === 0 ? (
          <h2>No resume found. Upload your first resume to get the feedback</h2>
        ) : (
          <h2>Review your submission and check AI-Powered feedback.</h2>
        )}
      </div>
      {loadingResumes && (
        <div className="flex flex-col items-center justify-center">
          <img src="/images/resume-scan-2.gif" className="w-[200px]" />
        </div>
      )}

      {loadingResumes && resumes.length > 0 && (
        <div className="resume-section">
          {resume.map(())}
        </div>
      )}

      {resume.length > 0 && (
        <div className="resumes-section">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}

        </div>
      )}

    </section>
  </main>;
}
