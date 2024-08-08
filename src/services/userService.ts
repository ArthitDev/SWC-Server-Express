import { getRepository } from "typeorm";
import { Admin } from "../entities/Admin";

export const findUserById = async (id: number) => {
  return getRepository(Admin).findOne({ where: { id } });
};
