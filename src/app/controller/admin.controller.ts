import {NextFunction, Request, Response} from "express";
import {ResponseError} from "../middleware/middleware";
import {ContentType, ResponseMessage, StatusCode} from "../services/rest.util";
import {UploadedFile} from "express-fileupload";
import {UtilService} from "../services/util.service";
import {AdminService} from "../service/admin.service";

export class AdminController {

    /************************************************************************************
     *                               Admin only
     ***********************************************************************************/
    static async allStudents(req: Request<any>, res: Response, next: NextFunction) {
        try {
            const data = await AdminService.allStudents();
            res.end(JSON.stringify(data));
        } catch (err) {
            next(err);
        }
    }

    static async deleteStudent(req: Request<any>, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            await AdminService.deleteStudent(id);

            res.end();
        } catch (err) {
            next(err);
        }
    }

    static async getAllowedUsers(req: Request<any>, res: Response, next: NextFunction) {
        try {
            const data = await AdminService.getAllowedUsers();
            res.end(JSON.stringify(data));
        } catch (err) {
            next(err);
        }

    }

    static async importAllowedUsers(req: Request<any>, res: Response, next: NextFunction) {
        if (!req.files) {
            next(new ResponseError(ResponseMessage.INCOMPLETE_FORM, StatusCode.BAD_REQUEST));
            return;
        }

        const file = req.files.file as UploadedFile;

        if (file === undefined) {
            next(new ResponseError(ResponseMessage.INCOMPLETE_FORM));
            return;
        }

        try {
            const rowsCreated = await AdminService.importAllowedUsers(file);

            res.statusCode = StatusCode.CREATED;

            res.setHeader('Content-Type', ContentType.TEXT);
            res.end(`${rowsCreated}`);
        } catch (err) {
            next(err);
        }
    }

    static async deleteAllowedStudent(req: Request<any>, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;

            await AdminService.deleteAllowedStudent(id);
            res.end();
        } catch (err) {
            next(err);
        }
    }

    static async sendSemesterActivityEmail(req: Request<any>, res: Response, next: NextFunction) {
        const body = req.body;
        const files = req.files;

        if (!files) {
            next(new ResponseError(ResponseMessage.INCOMPLETE_FORM, StatusCode.BAD_REQUEST));
            return;
        }

        if (!files.file) {
            next(new ResponseError(ResponseMessage.INCOMPLETE_FORM, StatusCode.BAD_REQUEST));
            return;
        }

        const file = files.file as UploadedFile;
        const email = body.emailTemplate;
        const subject = body.subject;
        const from = body.from;
        const recipientExcept = body.exceptRecipient;
        const send = `${body.send}` === 'true';

        let recipientExceptList: string[] = [];
        if (recipientExcept !== undefined) {
            const parsedRecipientExcept = recipientExcept.replace(new RegExp(/ /g), '');
            recipientExceptList = parsedRecipientExcept.split(',');
        }

        if (email === undefined || subject === undefined || from === undefined || file === undefined) {
            next(new ResponseError(ResponseMessage.INCOMPLETE_FORM, StatusCode.BAD_REQUEST));
            return;
        }

        try {
            const data = await AdminService.sendSemesterActivityEmail(email, subject, from, file, recipientExceptList, send);
            res.end(JSON.stringify(data));
        } catch (err) {
            next(err);
        }
    }

    static async exportForms(req: Request<any>, res: Response, next: NextFunction) {
        try {
            const fileBuffer: Buffer = await AdminService.exportForms();

            const fileName = `data_${UtilService.stringDate(new Date())}.zip`;

            res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
            res.setHeader('Content-type', ContentType.ZIP);

            res.end(fileBuffer);
        } catch (err) {
            next(err);
        }
    }

    static async faz(req: Request<any>, res: Response, next: NextFunction) {
        const body = req.body;
        const files = req.files;

        if (!files || body.ignoreStart === undefined || body.ignoreEnd === undefined || body.afterTableNote === undefined) {
            next(new ResponseError(ResponseMessage.INCOMPLETE_FORM, StatusCode.BAD_REQUEST));
            return;
        }

        const timetableFile = files.timetable as UploadedFile;

        if (timetableFile === undefined) {
            next(new ResponseError(ResponseMessage.INCOMPLETE_FORM, StatusCode.BAD_REQUEST));
            return;
        }

        try {
            const fileBuffer = await AdminService.faz(timetableFile, body.afterTableNote, body.ignoreStart, body.ignoreEnd);
            const fileName = `faz_${UtilService.stringDate(new Date())}.zip`;

            res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
            res.setHeader('Content-type', ContentType.ZIP);
            res.end(fileBuffer);
        } catch (err) {
            next(err);
        }
    }

    static async sendVerbalProcess(req: Request<any>, res: Response, next: NextFunction) {
        const body = req.body;
        const files = req.files;

        if (!files) {
            next(new ResponseError(ResponseMessage.INCOMPLETE_FORM, StatusCode.BAD_REQUEST));
            return;
        }

        if (files.file === undefined) {
            next(new ResponseError(ResponseMessage.INCOMPLETE_FORM, StatusCode.BAD_REQUEST));
            return;
        }

        const file = files.file as UploadedFile;
        const email = body.emailTemplate;
        const subject = body.subject;
        const from = body.from;
        const recipientExcept = body.exceptRecipient;
        const send = `${body.send}` === 'true';

        let recipientExceptList: string[] = [];
        if (recipientExcept !== undefined) {
            const parsedRecipientExcept = recipientExcept.replace(new RegExp(/ /g), '');
            recipientExceptList = parsedRecipientExcept.split(',');
        }

        if (email === undefined || subject === undefined || from === undefined || file === undefined) {
            next(new ResponseError(ResponseMessage.INCOMPLETE_FORM, StatusCode.BAD_REQUEST));
            return;
        }

        try {
            const file = files.file as UploadedFile;
            const emailResults = await AdminService.sendVerbalProcess(email, subject, from, file, recipientExceptList, send);

            res.end(JSON.stringify(emailResults));
        } catch (err) {
            next(err);
        }
    }

    static async sendThesisEmailNotification(req: Request<any>, res: Response, next: NextFunction) {
        const body = req.body;
        const files = req.files;

        if (!files) {
            next(new ResponseError(ResponseMessage.INCOMPLETE_FORM, StatusCode.BAD_REQUEST));
            return;
        }

        if (files.file === undefined) {
            next(new ResponseError(ResponseMessage.INCOMPLETE_FORM, StatusCode.BAD_REQUEST));
            return;
        }

        const file = files.file as UploadedFile;
        const email = body.emailTemplate;
        const from = body.from;
        const subject = body.subject;
        const recipientExcept = body.exceptRecipient;
        const send = `${body.send}` === 'true';

        let recipientExceptList: string[] = [];
        if (recipientExcept !== undefined) {
            const parsedRecipientExcept = recipientExcept.replace(new RegExp(/ /g), '');
            recipientExceptList = parsedRecipientExcept.split(',');
        }

        if (email === undefined || subject === undefined || from === undefined || file === undefined || !body.startDate || !body.endDate) {
            next(new ResponseError(ResponseMessage.INCOMPLETE_FORM, StatusCode.BAD_REQUEST));
            return;
        }

        if (isNaN(Date.parse(body.startDate)) || isNaN(Date.parse(body.endDate))) {
            next(new ResponseError(ResponseMessage.INVALID_DATE, StatusCode.BAD_REQUEST));
            return;
        }

        const startDate = new Date(body.startDate);
        const endDate = new Date(body.endDate);

        try {
            const data = await AdminService.sendThesisEmailNotification(email, subject, from, file, recipientExceptList, send, startDate, endDate);
            res.end(JSON.stringify(data));
        } catch (err) {
            next(err);
        }
    }

    static async importCoordinators(req: Request<any>, res: Response, next: NextFunction) {
        const files = req.files;

        if (!files) {
            next(new ResponseError(ResponseMessage.INCOMPLETE_FORM, StatusCode.BAD_REQUEST));
            return;
        }

        if (files.file === undefined) {
            next(new ResponseError(ResponseMessage.INCOMPLETE_FORM, StatusCode.BAD_REQUEST));
            return;
        }

        const file = files.file as UploadedFile;

        try {
            const rowsCreated = await AdminService.importCoordinators(file);

            res.setHeader('Content-Type', ContentType.TEXT);
            res.statusCode = StatusCode.CREATED;
            res.end(`${rowsCreated}`);
        } catch (err) {
            next(err);
        }
    }

    static async getCoordinators(req: Request<any>, res: Response, next: NextFunction) {
        try {
            const rows = await AdminService.getCoordinators();
            res.end(JSON.stringify(rows));
        } catch (err) {
            next(err);
        }
    }
    
}