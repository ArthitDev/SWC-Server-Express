import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Contact } from "../entities/Contact";

export const createContact = async (req: Request, res: Response) => {
  const contactRepository = getRepository(Contact);

  try {
    const { contact_name, contact_email, contact_message, contact_subject } =
      req.body;

    // สร้าง instance ของ Contact
    const newContact = contactRepository.create({
      contact_name,
      contact_email,
      contact_message,
      contact_subject,
    });

    // บันทึกข้อมูลลงฐานข้อมูล
    const savedContact = await contactRepository.save(newContact);

    // ส่งข้อมูลกลับไปในรูปแบบ JSON พร้อมสถานะ 201
    res.status(201).json(savedContact);
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({ message: "Error creating contact", error });
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลที่ยังไม่ได้อ่าน (is_read = 0)
export const getUnreadContacts = async (req: Request, res: Response) => {
  const contactRepository = getRepository(Contact);

  try {
    // ดึงข้อมูลเฉพาะ id และ isRead ที่มีค่า is_read = 0 (ยังไม่ถูกอ่าน)
    const unreadContacts = await contactRepository.find({
      select: ["id", "isRead"], // ระบุเฉพาะฟิลด์ที่ต้องการ
      where: { isRead: 0 }, // กำหนดเงื่อนไขการดึงข้อมูล
    });

    // ส่งข้อมูลที่ยังไม่ได้อ่านกลับในรูปแบบ JSON
    res.status(200).json(unreadContacts);
  } catch (error) {
    console.error("Error fetching unread contacts:", error);
    res.status(500).json({ message: "Error fetching unread contacts", error });
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลทั้งหมดของ contact โดยจัดเรียงตาม is_read โดยที่ is_read = 0 ก่อน
export const getAllContacts = async (req: Request, res: Response) => {
  const contactRepository = getRepository(Contact);

  try {
    // รับพารามิเตอร์ page, limit, category, และ search จาก query string
    const page = parseInt(req.query.page as string, 10) || 1; // Default หน้า 1
    const limit = parseInt(req.query.limit as string, 10) || 10; // Default 10 รายการต่อหน้า
    const category = req.query.category as string | undefined; // รับ category
    const search = req.query.search as string | undefined; // รับคำค้น (search term)

    // คำนวณค่า offset
    const offset = (page - 1) * limit;

    // สร้าง QueryBuilder
    let queryBuilder = contactRepository
      .createQueryBuilder("contact")
      .skip(offset)
      .take(limit)
      .orderBy("contact.isRead", "ASC")
      .addOrderBy("contact.createdAt", "DESC");

    // ถ้ามี category ให้เพิ่มเงื่อนไขในการค้นหา
    if (category) {
      queryBuilder = queryBuilder.andWhere("contact.contact_subject = :category", {
        category,
      });
    }

    // ถ้ามีคำค้น (search term) ให้เพิ่มเงื่อนไขในการค้นหาจากหลายคอลัมน์
    if (search) {
      queryBuilder = queryBuilder.andWhere(
        "contact.contact_name LIKE :search OR contact.contact_email LIKE :search OR contact.contact_message LIKE :search",
        { search: `%${search}%` }
      );
    }

    // นับจำนวนทั้งหมดของรายการที่ค้นหาได้
    const [contacts, total] = await queryBuilder.getManyAndCount();

    if (contacts.length === 0) {
      return res.status(200).json({ message: "No Contacts found" });
    }

    res.status(200).json({
      data: contacts,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching all contacts:", error);
    res.status(500).json({ message: "Error fetching all contacts", error });
  }
};


// ฟังก์ชันสำหรับอัปเดทค่า is_read
export const updateIsRead = async (req: Request, res: Response) => {
  const contactRepository = getRepository(Contact);

  try {
    // ดึงข้อมูล id และค่าใหม่ของ is_read จาก request
    const { id } = req.params;
    const { isRead } = req.body;

    // ค้นหา contact ที่ตรงกับ id
    const contact = await contactRepository.findOne({ where: { id: parseInt(id) } });

    // ตรวจสอบว่าพบ contact หรือไม่
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // อัปเดตค่า is_read
    contact.isRead = isRead;

    // บันทึกการเปลี่ยนแปลงลงในฐานข้อมูล
    const updatedContact = await contactRepository.save(contact);

    // ส่งข้อมูลที่อัปเดตกลับไปในรูปแบบ JSON
    res.status(200).json(updatedContact);
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ message: "Error updating contact", error });
  }
};

// ฟังก์ชันสำหรับลบ Contact ตาม id
export const deleteContact = async (req: Request, res: Response) => {
  const contactRepository = getRepository(Contact);

  try {
    // ดึง id ของ contact จาก request parameters
    const { id } = req.params;

    // ค้นหา contact ที่ตรงกับ id
    const contact = await contactRepository.findOne({ where: { id: parseInt(id) } });

    // ตรวจสอบว่าพบ contact หรือไม่
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    // ลบ contact จากฐานข้อมูล
    await contactRepository.remove(contact);

    // ส่งการตอบกลับเมื่อการลบสำเร็จ
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ message: "Error deleting contact", error });
  }
};
