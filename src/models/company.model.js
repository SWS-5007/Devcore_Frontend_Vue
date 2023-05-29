import BaseModel from "./base.model";
import {
    imageResolver
} from "../lib/utils";

export default class CompanyModel extends BaseModel {

    getLogoUrl(size = '0x0') {
        if (this.logoUrl) {
            return imageResolver(this.logoUrl, size);
        }
        return null;
    }


}