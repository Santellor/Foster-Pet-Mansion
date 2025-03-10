import { Sequelize } from 'sequelize';

async function connectToDB(dbURI) {
    console.log(`Connecting to Db: ${dbURI}`);

    const sequelize = new Sequelize(dbURI, {
        logging: console.log ,
        define: {
            underscored: true,
            timestamps: false
        },
        password: 'admin' 
    });

    try {
        await sequelize.authenticate();
        console.log(`Connected to DB successfully`);
    } catch (error) {
        console.error(`Unable to connect to DB ${dbURI}:, error`);
    }

    return sequelize;
}

export default connectToDB;