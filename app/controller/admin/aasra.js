const formidable = require("formidable");
const sequelize = require("../../connection/conn");
const Helper = require("../../helper/helper");
const aasra = require("../../model/aasra");
const users = require("../../model/users");
const generate_pass = require("generate-password");
const fs = require('fs');
const path = require('path');
const document = require("../../model/documents");
const { default: test } = require("node:test");
const city = require("../../model/city");
const states = require("../../model/state");
const { where } = require("sequelize");

exports.registerAasraCentre = async (req, res) => {
    try {
        const form = new formidable.IncomingForm();
        const unique_code = `AC_${await Helper.generateNumber(10000, 99999)}`;
        const rootUploadDir = 'documents/';
        form.parse(req, async function (err, fields, files) {
            if (err) {
                Helper.response("failed", "Error parsing the form", err, res, 500);
                return;
            }

            const transformedFields = {};
            const transformedFieldsFile = {};

            for (let key in fields) {
                transformedFields[key] = fields[key][0];
            }

            try {
                const createAasra = await aasra.create({
                    ...transformedFields,
                    unique_code: unique_code
                });

                if (createAasra) {
                    const password = generate_pass.generate({
                        length: 8,
                        numbers: true,
                        uppercase: true,
                        lowercase: true,
                    });

                    try {
                        const createUser = await users.create({
                            ref_id: createAasra.id,
                            user_type: 'AC',
                            email: createAasra.email,
                            password: Helper.decryptPassword(password),
                            passcode: password,
                            mobile: createAasra.mobile_no,
                            status: 1,
                        });

                        const imageFields = {
                            photoImg: 'user_images',
                            panImg: 'pan_images',
                            adhaarImg: 'adhaar_images',
                            areaImgs: 'area_images',
                            marketImg: 'market_images',
                            salesImg: 'sales_images',
                            signatureImg: 'sign_images',
                            regImg: 'reg_images'
                        };

                        const moveFile = async (file, folder, field) => {
                            const folderPath = path.join(rootUploadDir, folder);
                            if (!fs.existsSync(folderPath)) {
                                fs.mkdirSync(folderPath, { recursive: true });
                            }

                            const fileName = `${unique_code}_${file.originalFilename}`;
                            const filePath = path.join(folderPath, fileName);

                            try {
                                await fs.promises.rename(file.filepath, filePath);
                                transformedFieldsFile[field] = path.join(folder, fileName);
                                console.log(`File moved to ${filePath}`);
                            } catch (err) {
                                console.error(`Error moving the file (${file.originalFilename}):`, err);
                            }
                        };

                        for (const [field, folder] of Object.entries(imageFields)) {
                            if (files[field] && files[field][0]) {
                                await moveFile(files[field][0], folder, field);
                            } else {
                                console.error(`No file found for field '${field}'.`);
                            }
                        }

                        const documentData = await document.create({
                            ...transformedFieldsFile,
                            aasra_id: createAasra.id
                        }).then(() => {
                            Helper.response("success", "User registered successfully", createUser, res, 200);
                        })

                    } catch (error) {
                        console.log(error)
                        Helper.response("failed", "Unable to register user", error, res, 200);
                    }
                }
            } catch (err) {
                console.log(err)
                Helper.response("failed", "Unable to register", err, res, 200);
            }
        });
    } catch (error) {
        console.log(error);
        Helper.response("failed", "Server error", error, res, 500);
    }
};

exports.aasraList = async (req, res) => {
    try {
        const data = await aasra.findAll({
            include: [{
                model: document,
                as: 'document'
            }, {
                model: states,
                as: 'stateData',
                attributes: ['name','id'],

            }, {
                model: city,
                as: 'city',
                attributes: ['city','id'],
            }]
        });



        if (data) {
            Helper.response("success", "Aasra list", { data }, res, 200);
        }
        else {
            Helper.response("failed", "Unable to fetch list", [], res, 200);
        }


    } catch (error) {
        console.log(error)
        Helper.response("failed", "Server error", error, res, 200);
    }
}

exports.ashraInactive = async (req, res) => {

    try {
        const update = await users.update({
            status:0
        }, {
            where: {
                ref_id: req.body.id,
            }
        })
       
        if (update[0] === 1) {
          
            Helper.response(
                "success",
                "Record updated successfully",
                {},
                res,
                200
            );
        } else {
           
            Helper.response(
                "failed",
                "Record not found or update did not occur",
                {},
                res,
                200
            );
        }
    } catch (error) {
        Helper.response(
            "failed",
            "Something went wrong!",
            { error },
            res,
            200
        );
    }
}