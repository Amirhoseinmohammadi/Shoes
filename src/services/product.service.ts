import { prisma } from "@/lib/prisma";
import { ProductInput } from "@/types/product";

export const productService = {
  async getProducts(params?: {
    category?: string;
    search?: string;
    isActive?: boolean;
    brand?: string;
  }) {
    const where: Record<string, unknown> = {};

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    if (params?.category) {
      where.category = params.category;
    }

    if (params?.brand) {
      where.brand = params.brand;
    }

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { brand: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    return prisma.product.findMany({
      where,
      include: {
        variants: {
          include: {
            images: true,
            sizes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getProductById(id: number) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            images: true,
            sizes: true,
          },
        },
      },
    });
  },

  async createProduct(data: ProductInput) {
    return prisma.product.create({
      data: {
        name: data.name,
        brand: data.brand,
        price: data.price,
        description: data.description,
        image: data.image,
        category: data.category,
        isActive: data.isActive ?? true,
      },
      include: {
        variants: {
          include: {
            images: true,
            sizes: true,
          },
        },
      },
    });
  },

  async updateProduct(id: number, data: Partial<ProductInput>) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        variants: {
          include: {
            images: true,
            sizes: true,
          },
        },
      },
    });
  },

  async deleteProduct(id: number) {
    return prisma.product.delete({
      where: { id },
    });
  },

  async toggleProductStatus(id: number, isActive: boolean) {
    return prisma.product.update({
      where: { id },
      data: { isActive },
    });
  },
};
