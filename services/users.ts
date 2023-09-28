import {Users} from '../entities/users'
import database from "../utils/database"
import {Staff} from "../entities/staff";

type checkUserExist = {
    username?: string
    email?: string
    provider?: string
}
const getAll = async () => {
    const dataRepository = database.AppDataSource.getRepository(Users)
    return await dataRepository.find()
}

const getById = async (id: number) => {
    const dataRepository = database.AppDataSource.getRepository(Users)
    return await dataRepository.findOneBy({id: id})
}

const getByUsername = async (username: string) => {
    const dataRepository = database.AppDataSource.getRepository(Users)
    return await dataRepository.findOneBy({username: username})
}

const filter = async (data: Users) => {
    const dataRepository = database.AppDataSource.getRepository(Users)
    return await dataRepository.findBy({...data})
}

const create = async (data: Users) => {
    const dataRepository = database.AppDataSource.getRepository(Users)
    const result = await dataRepository.save(data)
    if (result.staff_code) {
        await setStaffCodeUse(result.staff_code)
    }
    return result
}

const update = async (id: number, data: Users) => {
    const dataRepository = database.AppDataSource.getRepository(Users)
    const findById = await getById(id)
    if (findById != null) {
        const updateData = {...findById, ...data}
        return await dataRepository.save(updateData)
    } else
        return null

}

const remove = async (id: number) => {
    const dataRepository = database.AppDataSource.getRepository(Users)
    const findById = await getById(id)
    if (findById != null)
        return await dataRepository.remove(findById)
    else
        return null
}

const checkUserExist = async (option: checkUserExist) => {
    const dataRepository = database.AppDataSource.getRepository(Users)
    const queryBuilder = dataRepository.createQueryBuilder('users')
    if (option.username)
        queryBuilder.orWhere('users.username = :username', {username: option.username})
    if (option.email)
        queryBuilder.orWhere('users.email = :email', {email: option.email})
    if (option.provider)
        queryBuilder.andWhere('users.provider = :provider', {provider: option.provider})
    return await queryBuilder.getOne()
}

const checkStaffCodeExist = async (staffCode: string) => {
    const dataRepository = database.AppDataSource.getRepository(Staff)
    return await dataRepository.findOneBy({staff_code: staffCode, is_use: false});
}

const setStaffCodeUse = async (staffCode: string) => {
    const dataRepository = database.AppDataSource.getRepository(Staff)
    const result = await checkStaffCodeExist(staffCode)
    if (result) {
        result.is_use = true
        await dataRepository.save(result)
    }
}

export default {getAll, getById, getByUsername, filter, create, update, remove, checkUserExist, checkStaffCodeExist}