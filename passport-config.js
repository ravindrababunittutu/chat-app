const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { User } = require('./database');

// Configure Passport to use the Local strategy
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await User.findOne({ where: { username } });
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

// Serialize user information into the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user information from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});
