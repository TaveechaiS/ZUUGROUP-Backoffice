export const AUDIT_ACTION_NAMES: Record<string, string> = {
  ADMIN_RECOVERED: 'กู้คืนบัญชี Admin',
  PRODUCT_SAMPLE_SEEDED: 'เพิ่มสินค้าตัวอย่าง',
  PRODUCT_SEEDED: 'เพิ่มข้อมูลสินค้าเริ่มต้น',
  PRODUCT_CREATED: 'เพิ่มสินค้า',
  PRODUCT_UPDATED: 'แก้ไขสินค้า',
  PRODUCT_DELETED: 'ลบสินค้า',
  PRODUCT_RESTORED: 'กู้คืนสินค้า',
  PRODUCT_MASTER_CREATED: 'เพิ่มข้อมูลแม่สินค้า',
  USER_CREATED: 'เพิ่มผู้ใช้งาน',
  USER_PROFILE_CHANGED: 'แก้ไขผู้ใช้งาน',
  USER_ROLE_CHANGED: 'เปลี่ยนบทบาท',
  USER_STATUS_CHANGED: 'เปลี่ยนสถานะผู้ใช้งาน',
  USER_DELETED: 'ลบผู้ใช้งาน',
  USER_RESTORED: 'กู้คืนผู้ใช้งาน',
  USER_RESTORED_AFTER_GUARD_FAILURE: 'กู้คืนผู้ใช้งานหลังตรวจสิทธิ์',
  PASSWORD_RESET_REQUESTED: 'ขอตั้งรหัสผ่านใหม่',
  PASSWORD_RESET: 'ตั้งรหัสผ่านใหม่',
};

export function actionName(action: string) {
  return AUDIT_ACTION_NAMES[action] ?? action;
}
