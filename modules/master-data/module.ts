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
import {
  registerCategoryRoutes,
  registerDepartmentRoutes,
  registerVendorRoutes,
} from "./infra/http/routes.js";
import { PrismaDepartmentRepository } from "./infra/persistence/PrismaDepartmentRepository.js";
import { PrismaDepartmentQueryRepository } from "./infra/persistence/PrismaDepartmentQueryRepository.js";
import { DepartmentDomainService } from "./application/services/DepartmentDomainService.js";
import { CreateDepartmentCommandHandler } from "./application/commands/create-department/handler.js";
import { UpdateDepartmentCommandHandler } from "./application/commands/update-department/handler.js";
import { DeleteDepartmentCommandHandler } from "./application/commands/delete-department/handler.js";
import { ActivateDepartmentCommandHandler } from "./application/commands/activate-department/handler.js";
import { DeactivateDepartmentCommandHandler } from "./application/commands/deactivate-department/handler.js";
import { GetDepartmentByIdQueryHandler } from "./application/queries/get-department-by-id/handler.js";
import { GetAllDepartmentsQueryHandler } from "./application/queries/get-all-departments/handler.js";
import { DepartmentController } from "./infra/http/controllers/DepartmentController.js";
import { PrismaVendorRepository } from "./infra/persistence/PrismaVendorRepository.js";
import { PrismaVendorQueryRepository } from "./infra/persistence/PrismaVendorQueryRepository.js";
import { VendorDomainService } from "./application/services/VendorDomainService.js";
import { CreateVendorCommandHandler } from "./application/commands/create-vendor/handler.js";
import { UpdateVendorCommandHandler } from "./application/commands/update-vendor/handler.js";
import { DeleteVendorCommandHandler } from "./application/commands/delete-vendor/handler.js";
import { ActivateVendorCommandHandler } from "./application/commands/activate-vendor/handler.js";
import { DeactivateVendorCommandHandler } from "./application/commands/deactivate-vendor/handler.js";
import { GetVendorByIdQueryHandler } from "./application/queries/get-vendor-by-id/handler.js";
import { GetAllVendorsQueryHandler } from "./application/queries/get-all-vendors/handler.js";
import { VendorController } from "./infra/http/controllers/VendorController.js";

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

  const getCategoryByIdHandler = new GetCategoryByIdQueryHandler(
    categoryQueryRepository
  );
  const getAllCategoriesHandler = new GetAllCategoriesQueryHandler(
    categoryQueryRepository
  );

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

  // Department Module
  const departmentRepository = new PrismaDepartmentRepository(prisma);
  const departmentQueryRepository = new PrismaDepartmentQueryRepository(prisma);

  const departmentDomainService = new DepartmentDomainService(
    departmentRepository
  );

  const createDepartmentHandler = new CreateDepartmentCommandHandler(
    departmentRepository,
    departmentDomainService
  );
  const updateDepartmentHandler = new UpdateDepartmentCommandHandler(
    departmentRepository,
    departmentQueryRepository,
    departmentDomainService
  );
  const deleteDepartmentHandler = new DeleteDepartmentCommandHandler(
    departmentRepository,
    departmentQueryRepository
  );
  const activateDepartmentHandler = new ActivateDepartmentCommandHandler(
    departmentRepository,
    departmentQueryRepository
  );
  const deactivateDepartmentHandler = new DeactivateDepartmentCommandHandler(
    departmentRepository,
    departmentQueryRepository
  );

  const getDepartmentByIdHandler = new GetDepartmentByIdQueryHandler(
    departmentQueryRepository
  );
  const getAllDepartmentsHandler = new GetAllDepartmentsQueryHandler(
    departmentQueryRepository
  );

  const departmentController = new DepartmentController(
    createDepartmentHandler,
    updateDepartmentHandler,
    deleteDepartmentHandler,
    activateDepartmentHandler,
    deactivateDepartmentHandler,
    getDepartmentByIdHandler,
    getAllDepartmentsHandler
  );

  await registerDepartmentRoutes(fastify, departmentController);

  // Vendor Module
  const vendorRepository = new PrismaVendorRepository(prisma);
  const vendorQueryRepository = new PrismaVendorQueryRepository(prisma);

  const vendorDomainService = new VendorDomainService(vendorRepository);

  const createVendorHandler = new CreateVendorCommandHandler(
    vendorRepository,
    vendorDomainService
  );
  const updateVendorHandler = new UpdateVendorCommandHandler(
    vendorRepository,
    vendorQueryRepository,
    vendorDomainService
  );
  const deleteVendorHandler = new DeleteVendorCommandHandler(
    vendorRepository,
    vendorQueryRepository
  );
  const activateVendorHandler = new ActivateVendorCommandHandler(
    vendorRepository,
    vendorQueryRepository
  );
  const deactivateVendorHandler = new DeactivateVendorCommandHandler(
    vendorRepository,
    vendorQueryRepository
  );

  const getVendorByIdHandler = new GetVendorByIdQueryHandler(vendorQueryRepository);
  const getAllVendorsHandler = new GetAllVendorsQueryHandler(vendorQueryRepository);

  const vendorController = new VendorController(
    createVendorHandler,
    updateVendorHandler,
    deleteVendorHandler,
    activateVendorHandler,
    deactivateVendorHandler,
    getVendorByIdHandler,
    getAllVendorsHandler
  );

  await registerVendorRoutes(fastify, vendorController);
}
