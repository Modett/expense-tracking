import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";
import { PrismaCategoryRepository } from "./infra/persistence/PrismaCategoryRepository.js";
import { PrismaCategoryQueryRepository } from "./infra/persistence/PrismaCategoryQueryRepository.js";
import { CategoryDomainService } from "./application/services/CategoryDomainService.js";
import { CreateCategoryCommandHandler } from "./application/commands/create-category/handler.js";
import { UpdateCategoryCommandHandler } from "./application/commands/update-category/handler.js";
import { DeleteCategoryCommandHandler } from "./application/commands/delete-category/handler.js";
import { ActivateCategoryCommandHandler } from "./application/commands/activate-category/handler.js";
import { DeactivateCategoryCommandHandler } from "./application/commands/deactivate-category/handler.js";
import { GetCategoryByIdQueryHandler } from "./application/queries/get-category-by-id/handler.js";
import { GetAllCategoriesQueryHandler } from "./application/queries/get-all-categories/handler.js";
import { CategoryController } from "./infra/http/controllers/CategoryController.js";
import { registerCategoryRoutes } from "./infra/http/routes.js";

export async function registerMasterDataModule(
  fastify: FastifyInstance,
  prisma: PrismaClient
): Promise<void> {
  const categoryRepository = new PrismaCategoryRepository(prisma);
  const categoryQueryRepository = new PrismaCategoryQueryRepository(prisma);

  const categoryDomainService = new CategoryDomainService(categoryRepository);

  const createCategoryHandler = new CreateCategoryCommandHandler(
    categoryRepository,
    categoryDomainService
  );
  const updateCategoryHandler = new UpdateCategoryCommandHandler(
    categoryRepository,
    categoryQueryRepository,
    categoryDomainService
  );
  const deleteCategoryHandler = new DeleteCategoryCommandHandler(
    categoryRepository,
    categoryQueryRepository
  );
  const activateCategoryHandler = new ActivateCategoryCommandHandler(
    categoryRepository,
    categoryQueryRepository
  );
  const deactivateCategoryHandler = new DeactivateCategoryCommandHandler(
    categoryRepository,
    categoryQueryRepository
  );

  const getCategoryByIdHandler = new GetCategoryByIdQueryHandler(categoryQueryRepository);
  const getAllCategoriesHandler = new GetAllCategoriesQueryHandler(categoryQueryRepository);

  const categoryController = new CategoryController(
    createCategoryHandler,
    updateCategoryHandler,
    deleteCategoryHandler,
    activateCategoryHandler,
    deactivateCategoryHandler,
    getCategoryByIdHandler,
    getAllCategoriesHandler
  );

  await registerCategoryRoutes(fastify, categoryController);
}
