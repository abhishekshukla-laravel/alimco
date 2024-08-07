const UserModel = require("../../model/users");
const validator = require('validator');
const CryptoJS = require("crypto-js");
const Helper = require("../../helper/helper");
const jwt = require("jsonwebtoken");
const Role = require("../../model/role");
const { use } = require("../../routes/customer");
const Menu = require("../../model/menu");
const subMenu = require("../../model/submenu");
const role_permission = require("../../model/role_permission");
const user_permission = require("../../model/user_permission");




exports.getUserList = async (req, res) => {
  try {
    const users = await UserModel.findAll({
      order: [["id", "DESC"]],
    });

    var data = [];
    function getData() {
      return Promise.all(
        users.map(async (user) => {

          var role = await Role.findOne({ where: { user_type: user.user_type } });

          // console.log(district.rows[0])
          return {
            role: role?.role ?? '-',
            id: user.id,
            name: user.name,
            password: user?.pass_code,
            mobile: user?.mobile,
            user_type: role?.id,
            email: user?.email,
            status: user?.status
          };
        })
      );
    }
    getData().then((values) => {
      values.forEach((e) => {
        data.push({
          name: e.name ? e.name : "",
          userTypeName: e.role ? e.role : "",
          mobile: e?.mobile ? e?.mobile : "--",
          id: e?.id,
          user_type_id: e.user_type,
          password: e.password ? e.password : "-",
          status: e.status,
          email: e.email
        });
      });
      Helper.response("Success", "Record Found Successfully", data, res, 200);
    });
  } catch (error) {
    console.log(error)
    Helper.response("Failed", "No Record Found", { error }, res, 200);
  }
};

exports.userCreate = async (req, res) => {
  try {
    const { email, user_type, name, mobile, status, password } = req.body
    if (!email || !user_type || !name || !mobile || !status || !password) {
      return Helper.response("Failed", "All fields are required", {}, res, 200);
    }
    if (user_type != 'S' && user_type != 'A') {
      return Helper.response("Failed", "Enter correct user type", {}, res, 200);
    }
    const encryptPassword = await Helper.encryptPassword(password)

    const user = await UserModel.create({ email, user_type, name, mobile, status, pass_code: password, password: encryptPassword })

    Helper.response("Success", "Record Created Successfully", user, res, 200);
  } catch (error) {
    console.log(error)
    Helper.response("Failed", "Unable to create User", error?.errors[0].message, res, 200)
  }
}

exports.getUserPermission = async (req, res) => {
  try {
    const isView = false;
    const isCreate = false;
    const isUpdate = false;
    const User = req.body.user_id;
    if (!User) {
      return Helper.response("Failed", "User Id is required", {}, res, 200);
    }
    const data = await user_permission.findAll({
      where: { userid: User },
    });

    const menu = await Menu.findAll();
    const totaldata = [];

    for (const e of menu) {
      const sub_menu_Data = await subMenu.findAll({
        where: { menu_id: e.dataValues.id },
      });

      if (sub_menu_Data.length > 0) {
        sub_menu_Data.forEach((f) => {
          const subMenuObject = {
            menu_id: e.dataValues.id,
            menu_name: e.dataValues.menu_name,
            sub_menu: f.dataValues.sub_menu,
            submenu_id: f.dataValues.id,
          };

          const permissionData = data.find((d) => d.menu_id === e.dataValues.id && d.submenu_id === f.dataValues.id);

          if (permissionData) {
            subMenuObject.isCreate = permissionData.isCreate || isCreate;
            subMenuObject.isView = permissionData.isView || isView;
            subMenuObject.isUpdate = permissionData.isUpdate || isUpdate;
          } else {
            subMenuObject.isCreate = isCreate;
            subMenuObject.isView = isView;
            subMenuObject.isUpdate = isUpdate;
          }

          totaldata.push(subMenuObject);
        });
      } else {
        const permissionData = data.find((d) => d.menu_id === e.dataValues.id);

        const subMenuObject = {
          menu_id: e.dataValues.id,
          menu_name: e.dataValues.menu_name,
          sub_menu: "",
          submenu_id: "",
          // isCreate: e.dataValues.isCreate || isCreate,
          // isView: e.dataValues.isView || isView,
          // isUpdate: e.dataValues.isUpdate || isUpdate,
        };

        if (permissionData) {
          subMenuObject.isCreate = permissionData.isCreate || isCreate;
          subMenuObject.isView = permissionData.isView || isView;
          subMenuObject.isUpdate = permissionData.isUpdate || isUpdate;
        } else {
          subMenuObject.isCreate = isCreate;
          subMenuObject.isView = isView;
          subMenuObject.isUpdate = isUpdate;
        }

        totaldata.push(subMenuObject);
      }
    }

    Helper.response("Success", "Record Found Successfully", totaldata, res, 200);
  } catch (error) {
    console.log(error)
    Helper.response("Failed", "Record Not Found", { error }, res, 200);
  }
};
exports.rolePermission = async (req, res) => {
  try {
    const reqData = req.body.data;

    const role_id = req.body.role_id;

    const roledata = await role_permission.destroy({
      where: { roleId: role_id },
    });
    if (roledata) {
      for (const element of reqData) {
        try {
          const menu_id = element.menu_id;
          const submenu_id = element.submenu_id || null;
          const isView = element.isView;
          const isCreate = element.isCreate;
          const isUpdate = element.isUpdate;

          const updateData = {
            roleId: role_id,
            menu_id: menu_id,
            submenu_id: submenu_id,
            isView: isView,
            isCreate: isCreate,
            isUpdate: isUpdate,
          };

          await rolePermission.create(updateData);
        } catch (error) {
          console.error("Error processing data:", error);
        }
      }
    } else {
      for (const element of reqData) {
        try {
          const menu_id = element.menu_id;
          const submenu_id = element.submenu_id || null;
          const isView = element.isView;
          const isCreate = element.isCreate;
          const isUpdate = element.isUpdate;

          const updateData = {
            roleId: role_id,
            menu_id: menu_id,
            submenu_id: submenu_id,
            isView: isView,
            isCreate: isCreate,
            isUpdate: isUpdate,
          };

          await rolePermission.create(updateData);
        } catch (error) {
          console.error("Error processing data:", error);
        }
      }
    }

    Helper.response("Success", "Record Updated Successfully", {}, res, 200);
  } catch (err) {
    console.error("Error:", err);
    Helper.response("Error", "Internal Server Error", {}, res, 500);
  }
};
exports.RoleList = async (req, res) => {
  try {
    const role = await Role.findAll({ order: [["role_name", "ASC"]] });
    const list = [];
    role.forEach((element) => {
      list.push({
        id: element.dataValues.id,
        role_name: element.dataValues.role_name,
        created_at: Helper.getDateTime(element.dataValues.createdAt),
      });
    });
    Helper.response("Success", "Record Feteched Successfully", { list: list }, res, 200);
  } catch (error) {
    Helper.response("Failed", "Record Not Found", { error }, res, 200);
  }
};
exports.getRolePermission = async (req, res) => {
  try {
    const isView = false;
    const isCreate = false;
    const isUpdate = false;
    const role = req.body.value;
    if (!role) {
      Helper.response("Failed", "Role is required", {}, res, 200);
    }
    const data = await role_permission.findAll({
      where: { roleId: role },
    });

    const menu = await Menu.findAll();
    const totaldata = [];

    for (const e of menu) {
      const sub_menu_Data = await subMenu.findAll({
        where: { menu_id: e.dataValues.id },
      });

      if (sub_menu_Data.length > 0) {
        sub_menu_Data.forEach((f) => {
          const subMenuObject = {
            menu_id: e.dataValues.id,
            menu_name: e.dataValues.menu_name,
            sub_menu: f.dataValues.sub_menu,
            submenu_id: f.dataValues.id,
          };

          const permissionData = data.find((d) => d.menu_id === e.dataValues.id && d.submenu_id === f.dataValues.id);

          if (permissionData) {
            subMenuObject.isCreate = permissionData.isCreate || isCreate;
            subMenuObject.isView = permissionData.isView || isView;
            subMenuObject.isUpdate = permissionData.isUpdate || isUpdate;
          } else {
            subMenuObject.isCreate = isCreate;
            subMenuObject.isView = isView;
            subMenuObject.isUpdate = isUpdate;
          }

          totaldata.push(subMenuObject);
        });
      } else {
        const permissionData = data.find((d) => d.menu_id === e.dataValues.id);

        const subMenuObject = {
          menu_id: e.dataValues.id,
          menu_name: e.dataValues.menu_name,
          sub_menu: "",
          submenu_id: "",
          // isCreate: e.dataValues.isCreate || isCreate,
          // isView: e.dataValues.isView || isView,
          // isUpdate: e.dataValues.isUpdate || isUpdate,
        };

        if (permissionData) {
          subMenuObject.isCreate = permissionData.isCreate || isCreate;
          subMenuObject.isView = permissionData.isView || isView;
          subMenuObject.isUpdate = permissionData.isUpdate || isUpdate;
        } else {
          subMenuObject.isCreate = isCreate;
          subMenuObject.isView = isView;
          subMenuObject.isUpdate = isUpdate;
        }

        totaldata.push(subMenuObject);
      }
    }

    Helper.response("Success", "Record Updated Successfully", totaldata, res, 200);
  } catch (error) {
    console.log(error)
    Helper.response("Failed", "Record Not Found", { error }, res, 200);
  }
};
exports.userPermission = async (req, res) => {
  try {
    const reqData = req.body.data;

    // const token = req.headers["authorization"];
    // const string = token.split(" ");
    // const userToken = { token: string[1] };
    // console.log(userToken)
    // const user = await UserModel.getUser({ token: string[1] });
    const user_id = req.body.user_id;
    const role_id = (await register.findByPk(user_id)).dataValues.user_type;

    const userdata = await userPermission.destroy({
      where: { userid: user_id },
    });

    if (userdata) {
      for (const element of reqData) {
        try {
          const menu_id = element.menu_id;
          const submenu_id = element.submenu_id || null;
          const isView = element.isView;
          const isCreate = element.isCreate;
          const isUpdate = element.isUpdate;

          const updateData = {
            userid: req.body.user_id,
            userTypeId: role_id,
            roleId: role_id,
            menu_id: menu_id,
            submenu_id: submenu_id,
            isView: isView,
            isCreate: isCreate,
            isUpdate: isUpdate,
          };

          await userPermission.create(updateData);
        } catch (error) {
          console.error("Error processing data:", error);
        }
      }
    } else {
      for (const element of reqData) {
        try {
          const menu_id = element.menu_id;
          const submenu_id = element.submenu_id || null;
          const isView = element.isView;
          const isCreate = element.isCreate;
          const isUpdate = element.isUpdate;

          const updateData = {
            userid: req.body.user_id,
            userTypeId: role_id,
            roleId: role_id,
            menu_id: menu_id,
            submenu_id: submenu_id,
            isView: isView,
            isCreate: isCreate,
            isUpdate: isUpdate,
          };

          await userPermission.create(updateData);
        } catch (error) {
          console.error("Error processing data:", error);
        }
      }
    }

    Helper.response("Success", "Record Updated Successfully", {}, res, 200);
  } catch (err) {
    console.error("Error:", err);
    Helper.response("Error", "Internal Server Error", {}, res, 200);
  }
};