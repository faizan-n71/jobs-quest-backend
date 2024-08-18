import { prisma } from "@lib/prisma";

export const getOrganizationById = async ({
  organizationId,
}: {
  organizationId: string;
}) => {
  return await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });
};

export const getOrganizationByUserId = async ({
  userId,
}: {
  userId: string;
}) => {
  return await prisma.organization.findMany({
    where: {
      ownerId: userId,
    },
  });
};

export const deleteOrganizationById = async ({
  organizationId,
}: {
  organizationId: string;
}) => {
  return await prisma.organization.delete({
    where: {
      id: organizationId,
    },
  });
};

export const fetchAllOrganizations = async () => {
  return await prisma.organization.findMany();
};
