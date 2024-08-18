import { getOrganizationById } from "@actions/OrganizationAction";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@lib/constants";
import {
  ApplyForJobSchema,
  CreateJobSchema,
  UpdateJobSchema,
} from "@lib/schemas";
import { formatZodError, getCurrentUser } from "@lib/utils";
import type { Request, Response } from "express";

export const createJob = async (req: Request, res: Response) => {
  const {
    title,
    smallDescription,
    description,
    averagePayRange,
    averageTime,
    location,
  } = req.body;

  const { organizationId } = req.query as { organizationId: string };

  if (!organizationId) {
    return res.status(400).json({ message: ERROR_MESSAGES.ORGANIZATION.NoId });
  }

  const jobData = {
    title,
    smallDescription,
    description,
    averagePayRange,
    averageTime,
    location,
  };

  const validated = CreateJobSchema.safeParse(jobData);
  if (!validated.success) {
    return res.status(400).json({
      message: formatZodError(validated) || ERROR_MESSAGES.InvalidInput,
    });
  }

  try {
    const job = await prisma.job.create({
      data: {
        ...jobData,
        organizationId,
      },
    });

    return res.status(200).json({ message: SUCCESS_MESSAGES.JOB.Create, job });
  } catch (err) {
    return res.status(500).json({ message: ERROR_MESSAGES.Default });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  const { organizationId } = req.query as {
    organizationId: string;
  };

  const { id: jobId } = req.params;

  if (!jobId) {
    return res.status(400).json({ message: ERROR_MESSAGES.JOB.NoId });
  }

  if (!organizationId) {
    return res.status(400).json({ message: ERROR_MESSAGES.ORGANIZATION.NoId });
  }

  const {
    title,
    smallDescription,
    description,
    averagePayRange,
    averageTime,
    location,
  } = req.body;

  const updateJobData = {
    title,
    smallDescription,
    description,
    averagePayRange,
    averageTime,
    location,
  };

  const validated = UpdateJobSchema.safeParse(updateJobData);

  if (!validated.success) {
    return res.status(400).json({
      message: formatZodError(validated) || ERROR_MESSAGES.InvalidInput,
    });
  }

  const { user } = await getCurrentUser(req);

  if (!user) {
    return res
      .status(401)
      .json({ message: ERROR_MESSAGES.USER.ActionUnauthorized });
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
    });

    if (!organization) {
      return res
        .status(404)
        .json({ menssage: ERROR_MESSAGES.ORGANIZATION.NotExists });
    }

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      return res.status(404).json({ menssage: ERROR_MESSAGES.JOB.NotExists });
    }

    const isOrganizationOwner = organization.ownerId === user.id;
    const isJobOwner = job.organizationId === organization.id;

    const isOwner = isOrganizationOwner && isJobOwner;

    if (!isOwner) {
      return res
        .status(401)
        .json({ message: ERROR_MESSAGES.USER.ActionUnauthorized });
    }

    const updateJob = await prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        ...updateJobData,
      },
    });

    return res
      .status(200)
      .json({ message: SUCCESS_MESSAGES.JOB.Update, job: updateJob });
  } catch (err) {
    return res.status(500).json({ message: ERROR_MESSAGES.Default });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  const { id: jobId } = req.params;

  if (!jobId) {
    return res.status(400).json({ message: ERROR_MESSAGES.JOB.NoId });
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    return res.status(404).json({ message: ERROR_MESSAGES.JOB.NotExists });
  }

  const organization = await prisma.organization.findUnique({
    where: { id: job.organizationId },
    include: {
      jobs: true,
    },
  });

  if (!organization) {
    return res
      .status(404)
      .json({ message: ERROR_MESSAGES.ORGANIZATION.NotExists });
  }

  const { user } = await getCurrentUser(req);

  if (!user) {
    return res
      .status(401)
      .json({ message: ERROR_MESSAGES.USER.ActionUnauthorized });
  }
  const isOrganizationOwner = organization.ownerId === user.id;
  const isJobOwner = organization.jobs.reduce(
    (acc: any, job) => acc || jobId === job.id
  );

  const isOwner = !!isOrganizationOwner && !!isJobOwner;

  if (!isOwner) {
    return res
      .status(401)
      .json({ message: ERROR_MESSAGES.USER.ActionUnauthorized });
  }

  const deletedJob = await prisma.job.delete({
    where: { id: jobId },
  });

  return res.status(200).json({ isOwner, job: deletedJob });
};

export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.job.findMany({});
    return res.status(200).json({ message: SUCCESS_MESSAGES.JOB.Fetch, jobs });
  } catch (err) {
    return res.status(500).json({ message: ERROR_MESSAGES.Default });
  }
};

export const getJobsByOrganization = async (req: Request, res: Response) => {
  const { organizationId } = req.params;

  if (!organizationId) {
    return res.status(400).json({ message: ERROR_MESSAGES.ORGANIZATION.NoId });
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
      include: {
        jobs: true,
      },
    });

    if (!organization) {
      return res
        .status(404)
        .json({ message: ERROR_MESSAGES.ORGANIZATION.NotExists });
    }

    return res.status(200).json({ message: SUCCESS_MESSAGES.JOB.Fetch });
  } catch (err) {
    return res.status(500).json({ message: ERROR_MESSAGES.Default });
  }
};

export const getAppliedJobs = async (req: Request, res: Response) => {
  const { user } = await getCurrentUser(req);

  if (!user) {
    return res
      .status(401)
      .json({ message: ERROR_MESSAGES.USER.ActionUnauthorized });
  }

  try {
    const jobs = await prisma.job.findMany({
      where: {
        applicants: {
          some: {
            applicantId: user.id,
          },
        },
      },
    });

    return res.status(200).json({ message: SUCCESS_MESSAGES.JOB.Fetch, jobs });
  } catch (err) {
    return res.status(500).json({ message: ERROR_MESSAGES.Default });
  }
};

export const getJob = async (req: Request, res: Response) => {
  const { id: jobId } = req.params;
  if (!jobId) {
    return res.status(400).json({ message: ERROR_MESSAGES.JOB.NoId });
  }
  try {
    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      return res.status(404).json({ message: ERROR_MESSAGES.JOB.NotExists });
    }

    return res.status(200).json({ message: SUCCESS_MESSAGES.JOB.Fetch, job });
  } catch (err) {
    return res.status(500).json({ message: ERROR_MESSAGES.Default });
  }
};

export const applyForJob = async (req: Request, res: Response) => {
  const { id: jobId } = req.params;
  const { proposal } = req.body;

  if (!proposal) {
    return res.status(400).json({ message: ERROR_MESSAGES.JOB.NoProposal });
  }

  if (!jobId) {
    return res.status(400).json({ message: ERROR_MESSAGES.JOB.NoId });
  }

  const { user } = await getCurrentUser(req);

  if (!user) {
    return res
      .status(401)
      .json({ message: ERROR_MESSAGES.USER.ActionUnauthorized });
  }

  const validated = ApplyForJobSchema.safeParse({ proposal });

  if (!validated.success) {
    return res
      .status(400)
      .json({
        message: formatZodError(validated) || ERROR_MESSAGES.InvalidInput,
      });
  }

  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { organization: true, applicants: true },
    });

    if (!job) {
      return res.status(404).json({ message: ERROR_MESSAGES.JOB.NotExists });
    }

    if (job.organization.ownerId === user.id) {
      return res
        .status(401)
        .json({ message: ERROR_MESSAGES.USER.ActionUnauthorized });
    }

    const isJobApplicant = job.applicants.reduce(
      (acc: any, applicant) => acc || applicant.id === user.id
    );

    if (isJobApplicant) {
      return res
        .status(200)
        .json({ message: SUCCESS_MESSAGES.JOB.AppliedAlready });
    }

    const applicant = await prisma.applicant.create({
      data: {
        applicantId: user.id,
        jobsAppliedId: job.id,
        proposal,
      },
    });

    return res
      .status(200)
      .json({ message: SUCCESS_MESSAGES.JOB.Apply, applicant });
  } catch (err) {}
};
