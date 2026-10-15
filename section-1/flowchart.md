# แผนภาพแสดงการทำงานของระบบ (System Flowchart)

```mermaid
flowchart TD
    Start([เริ่มต้น เข้าสู่ระบบ]) --> LoginForm[/แสดงหน้าจอ Login/]
    LoginForm --> SubmitLogin[ผู้ใช้ส่ง Username / Password]
    
    SubmitLogin --> CheckCreds{ตรวจสอบข้อมูลผ่าน Mock API?}
    CheckCreds -- "ไม่ถูกต้อง (Failed)" --> LoginErr[แสดงข้อความ Error Alert แจ้งเตือนผู้ใช้]
    LoginErr --> LoginForm
    
    CheckCreds -- "ถูกต้อง (Success)" --> SetAuth[บันทึก User Session และ Token ลงใน AuthContext]
    SetAuth --> CheckRole{บทบาทของผู้ใช้ (Role)?}
    
    %% กรณี Admin Flow
    CheckRole -- "Admin" --> AdminRedirect[นำทางไปยัง /admin]
    AdminRedirect --> AdminCheckGuard{เข้าถึงหน้าใด?}
    
    AdminCheckGuard -- "เข้า /admin" --> AdminDash[/แดชบอร์ด Admin: แสดง Task ทั้งหมด + ฟอร์มสร้าง Task/]
    AdminCheckGuard -- "พยายามเข้า /employee" --> AdminGuardBlock[Route Guard: ปฏิเสธการเข้าถึง]
    AdminGuardBlock --> AlertAdminRedirect[แสดง Alert Banner แจ้งเตือน + Redirect กลับ /admin]
    AlertAdminRedirect --> AdminDash
    
    AdminDash --> AdminAction{การดำเนินการของ Admin}
    AdminAction -- "สร้าง Task ใหม่" --> AdminCreateTask[ระบุชื่องาน และเลือกพนักงานผู้รับผิดชอบ]
    AdminCreateTask --> UpdateListImmediate[บันทึกและอัปเดตรายการ Task ทันที]
    UpdateListImmediate --> AdminDash
    
    AdminAction -- "เปลี่ยนสถานะ Task ใดๆ" --> AdminChangeStatus[เปลี่ยน To Do <-> Done ได้ทุก Task]
    AdminChangeStatus --> UpdateListImmediate
    
    %% กรณี Employee Flow
    CheckRole -- "Employee" --> EmpRedirect[นำทางไปยัง /employee]
    EmpRedirect --> EmpCheckGuard{เข้าถึงหน้าใด?}
    
    EmpCheckGuard -- "เข้า /employee" --> EmpDash[/หน้าต่าง Employee: แสดงเฉพาะ Task ที่ได้รับมอบหมาย/]
    EmpCheckGuard -- "พยายามเข้า /admin" --> EmpGuardBlock[Route Guard: ปฏิเสธการเข้าถึง]
    EmpGuardBlock --> AlertEmpRedirect[แสดง Alert Banner แจ้งเตือน + Redirect กลับ /employee]
    AlertEmpRedirect --> EmpDash
    
    EmpDash --> EmpAction{การดำเนินการของ Employee}
    
    %% การเปลี่ยนสถานะโดย Employee
    EmpAction -- "กดเปลี่ยนสถานะ Task" --> CheckOwnership{Task เป็นของตนเองหรือไม่?}
    CheckOwnership -- "ไม่ใช่ (Not Owner)" --> DenyNotOwner[ปฏิเสธ 403: ไม่มีสิทธิ์แก้ไข Task ของผู้อื่น]
    DenyNotOwner --> EmpDash
    
    CheckOwnership -- "ใช่ (Owner)" --> CheckCurrentStatus{สถานะปัจจุบันเป็น Done หรือไม่?}
    CheckCurrentStatus -- "เป็น Done อยู่แล้ว" --> DenyReopen[ปฏิเสธ: ล็อกสถานะ ห้ามย้อนจาก Done กลับเป็น To Do]
    DenyReopen --> EmpDash
    
    CheckCurrentStatus -- "เป็น To Do" --> AllowDone[อนุญาต: เปลี่ยนสถานะ To Do -> Done และบันทึกลงระบบทันที]
    AllowDone --> EmpDash
    
    %% Logout Flow
    AdminDash --> ClickLogout[คลิกปุ่มออกจากระบบ Logout]
    EmpDash --> ClickLogout
    ClickLogout --> ClearAuth[ล้างข้อมูล AuthContext และ Token ออกจาก LocalStorage]
    ClearAuth --> RedirectToLogin[นำทางกลับสู่หน้า Login]
    RedirectToLogin --> End([สิ้นสุด Session])
```
