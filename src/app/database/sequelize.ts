import {
    Association,
    CreationOptional,
    DataTypes,
    HasManyAddAssociationMixin,
    HasManyCountAssociationsMixin,
    HasManyCreateAssociationMixin,
    HasManyGetAssociationsMixin,
    HasManyHasAssociationMixin, HasManyHasAssociationsMixin,
    HasManyRemoveAssociationMixin, HasManyRemoveAssociationsMixin,
    HasManySetAssociationsMixin,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
    Sequelize
} from '@sequelize/core';
import {BaseInformation, ScientificArticleISI, User, UserKey} from "./models";

require('dotenv').config();
const env = process.env as any;

const sequelize = new Sequelize(env.DB_NAME, env.DB_USERNAME, env.DB_PASSWORD, {
    host: env.DB_HOST,
    dialect: env.DB_DIALECT,
    logging: false,
});

const options = {
    sequelize: sequelize,
    timestamps: true,
    underscored: true,
};

/** --------------------============== Table Initialization ==============-------------------- */
export class BaseInformationModel extends Model {}
BaseInformationModel.init( {
    fullName:   {type: DataTypes.STRING, allowNull: false,},
    identifier: {type: DataTypes.STRING, allowNull: false, unique: true,},
}, {...options, modelName: 'base_information'});

export class UserModel extends Model {
    declare getProjects: HasManyGetAssociationsMixin<Project>; // Note the null assertions!
    declare addProject: HasManyAddAssociationMixin<Project, number>;
    declare addProjects: HasManyAddAssociationMixin<Project, number>;
    declare setProjects: HasManySetAssociationsMixin<Project, number>;
    declare removeProject: HasManyRemoveAssociationMixin<Project, number>;
    declare removeProjects: HasManyRemoveAssociationsMixin<Project, number>;
    declare hasProject: HasManyHasAssociationMixin<Project, number>;
    declare hasProjects: HasManyHasAssociationsMixin<Project, number>;
    declare countProjects: HasManyCountAssociationsMixin;
    declare createProject: HasManyCreateAssociationMixin<Project, 'ownerId'>;

    declare projects?: NonAttribute<Project[]>; // Note this is optional since it's only populated when explicitly requested in code
}

class Project extends Model { }
Project.init({
        ownerId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        name: {
            type: new DataTypes.STRING(128),
            allowNull: false
        },
    },
    {
        sequelize,
        tableName: 'projects'
    }
);

UserModel.init(
    {
        identifier: {
            type: new DataTypes.STRING(128),
            allowNull: false
        },
        admin: {
            type: new DataTypes.BOOLEAN,
            allowNull: false
        },
        email: {
            type: new DataTypes.STRING(128),
            allowNull: false
        },
        alternativeEmail: {
            type: new DataTypes.STRING(128),
            allowNull: false
        },
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
        },
    },
    {
        tableName: 'users',
        sequelize // passing the `sequelize` instance is required
    }
);

UserModel.hasMany(Project, {
    sourceKey: 'id',
    foreignKey: 'ownerId',
    as: 'projects' // this determines the name in `associations`!
});









export class UserKeyModel extends Model {}
UserKeyModel.init({
    identifier: {type: DataTypes.STRING, unique: true, allowNull: false,},
    key:        {type: DataTypes.STRING, unique: true, allowNull: false,},
}, {...options, modelName: 'user_key'});

/** --------------------============== Forms ==============-------------------- */
export class ScientificArticleISIModel extends Model {}
ScientificArticleISIModel.init({
    observations: {type: DataTypes.STRING,},
}, {...options, modelName: 'sc_article_isi'});

export async function sequelizeInit() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }

    UserModel.hasMany(ScientificArticleISIModel);

    await sequelize.sync({ force: true });

    await BaseInformationModel.build({fullName: 'Stamate Valentin', identifier: 'valentin'}).save();
    const user = await UserModel.build({identifier: 'valentin',
        email: 'stamatevalentin125@gmail.com', alternativeEmail: 'valentin.stamate@info.uaic.ro', admin: true}).save();
    const isiRow = await ScientificArticleISIModel.build({observations: 'Artical', userId: 1}).save();

    const project = await user.createProject({
        name: 'first!'
    });

    const ourUser = await UserModel.findByPk(1, {
        include: [UserModel.associations.projects],
        rejectOnEmpty: true,
    })

    console.log(ourUser.toJSON());
    console.log(await ourUser.getProjects());
}