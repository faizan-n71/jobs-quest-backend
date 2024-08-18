import {
  deleteOrganizationById,
  fetchAllOrganizations,
  getOrganizationById,
  getOrganizationByUserId,
} from "@actions/OrganizationAction";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@lib/constants";
import {
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
} from "@lib/schemas";
import { formatZodError, getCurrentUser } from "@lib/utils";
import { Request, Response } from "express";

export const createOrganization = async (req: Request, res: Response) => {
  const { name, averagePayRange, totalEmployees, description, location } =
    req.body;

  const organizationData = {
    name,
    averagePayRange,
    totalEmployees,
    description,
    location,
  };

  const validated = CreateOrganizationSchema.safeParse(organizationData);

  if (!validated.success) {
    return res.status(400).json({
      message: formatZodError(validated) || ERROR_MESSAGES.InvalidInput,
    });
  }

  const { user } = await getCurrentUser(req);

  if (!user) {
    return res.status(401).json({ message: "You Cannot Perform This Action" });
  }

  try {
    const organization = await prisma.organization.create({
      data: {
        ...organizationData,
        ownerId: user.id,
      },
    });

    return res.status(201).json({
      organization,
      message: SUCCESS_MESSAGES.ORGANIZATION.Create,
    });
  } catch (err) {
    console.log("ERROR: ACTION: CREATE_ORGANIZATION", err);
    return res.status(500).json({ message: ERROR_MESSAGES.Default });
  }
};

export const getOrganization = async (req: Request, res: Response) => {
  const { id: organizationId } = req.params;
  if (!organizationId) {
    return res.status(400).json({ message: ERROR_MESSAGES.ORGANIZATION.NoId });
  }

  try {
    const organization = await getOrganizationById({ organizationId });
    res
      .status(200)
      .json({ message: SUCCESS_MESSAGES.ORGANIZATION.Fetch, organization });
  } catch (err) {
    return res.status(500).json({ message: ERROR_MESSAGES.Default });
  }
};

export const getCurrentUserOrganization = async (
  req: Request,
  res: Response
) => {
  const { user } = await getCurrentUser(req);

  if (!user) {
    return res
      .status(401)
      .json({ message: ERROR_MESSAGES.USER.ActionUnauthorized });
  }

  try {
    const organizations = await getOrganizationByUserId({ userId: user.id });

    return res
      .status(200)
      .json({ message: SUCCESS_MESSAGES.ORGANIZATION.Fetch, organizations });
  } catch (err) {
    return res.status(500).json({ message: ERROR_MESSAGES.Default });
  }
};

export const getAllOrganizations = async (req: Request, res: Response) => {
  try {
    const organizations = await fetchAllOrganizations();
    return res
      .status(200)
      .json({ message: SUCCESS_MESSAGES.ORGANIZATION.Fetch, organizations });
  } catch (err) {
    return res.status(500).json({ message: ERROR_MESSAGES.Default });
  }
};

export const updateOrganization = async (req: Request, res: Response) => {
  const { id: organizationId } = req.params;

  const { name, averagePayRange, totalEmployees, description, location } =
    await req.body;

  if (!organizationId) {
    return res.status(400).json({ message: ERROR_MESSAGES.ORGANIZATION.NoId });
  }

  const updateOrganizationData = {
    name,
    averagePayRange,
    totalEmployees,
    description,
    location,
  };

  const validated = UpdateOrganizationSchema.safeParse(updateOrganizationData);

  if (!validated.success) {
    return res.status(400).json({
      message: formatZodError(validated) || ERROR_MESSAGES.InvalidInput,
    });
  }

  try {
    const organization = await getOrganizationById({ organizationId });

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

    const isOwner = organization.ownerId === user.id;

    if (!isOwner) {
      return res
        .status(401)
        .json({ message: ERROR_MESSAGES.USER.ActionUnauthorized });
    }

    const updated = await prisma.organization.update({
      where: {
        id: organizationId,
        ownerId: user.id,
      },
      data: { ...updateOrganizationData },
    });

    return res
      .status(200)
      .json({
        message: SUCCESS_MESSAGES.ORGANIZATION.Update,
        organization: updated,
      });
  } catch (err) {
    return res.status(500).json({ message: ERROR_MESSAGES.Default });
  }
};

export const deleteOrganization = async (req: Request, res: Response) => {
  const { id: organizationId } = req.params;

  if (!organizationId) {
    return res.status(400).json({ message: ERROR_MESSAGES.ORGANIZATION.NoId });
  }

  const { user } = await getCurrentUser(req);
  const organization = await getOrganizationById({ organizationId });

  if (!organization) {
    return res
      .status(400)
      .json({ message: ERROR_MESSAGES.ORGANIZATION.NotExists });
  }

  if (!user || organization.ownerId !== user.id) {
    return res
      .status(401)
      .json({ message: ERROR_MESSAGES.USER.ActionUnauthorized });
  }

  const deletedOrganization = await deleteOrganizationById({ organizationId });

  return res.status(200).json({
    message: SUCCESS_MESSAGES.ORGANIZATION.Delete,
    organization: deletedOrganization,
  });
};
