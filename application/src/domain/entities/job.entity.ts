import { v4 as uuidv4 } from 'uuid';
import { ExportFormat, ExportStatus } from '@domain/enums/all.enums';

export class JobEntity {
    private readonly _id: string;   
    private status: ExportStatus;
    private export_format: ExportFormat;
    private query: any;
    private file_url: string;
    private readonly created_at: Date;
    private readonly updated_at: Date;

    constructor(props: { _id: string; status: ExportStatus; export_format: ExportFormat; query: any; file_url: string; created_at?: Date; updated_at?: Date }) {
        this._id = props._id || uuidv4();
        this.status = props.status;
        this.export_format = props.export_format;
        this.query = props.query;
        this.file_url = props.file_url;
        this.created_at = props.created_at || new Date();
        this.updated_at = props.updated_at || new Date();
    }

    // Getters
    getId(): string {
        return this._id;
    }

    getStatus(): ExportStatus {
        return this.status;
    }

    getExportFormat(): ExportFormat {
        return this.export_format;
    }

    getQuery(): any {
        return this.query;
    }

    getFileUrl(): string {
        return this.file_url;
    }

    getCreatedAt(): Date {
        return this.created_at;
    }

    getUpdatedAt(): Date {
        return this.updated_at;
    }
}