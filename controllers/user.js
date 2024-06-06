const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../auth');

module.exports.registerUser = (req, res) => {

    let newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10), 
        mobileNo: req.body.mobileNo
    });


    if (!req.body.email.includes("@")){
        return res.status(400).send({error: 'Email invalid'});
    }
    else if (req.body.mobileNo.length !== 11){
        return res.status(400).send({error: 'Mobile number invalid'});
    }
    else if (req.body.password.length < 8) {
        return res.status(400).send({error: 'Password must be atleast 8 characters'});
    } else {
        return newUser.save().then(userRegistered => res.status(201).send({message: 'Registered Successfully'})).catch(saveErr => {
            
            console.error('Error in Save: ', saveErr);
            res.status(500).send({ error : 'Error in Save' });
        });
    }

    
};

module.exports.loginUser = (req, res) => {

    if (req.body.email.includes('@')) {
        return User.findOne({email: req.body.email}).then(user => {

            if(user == null) { 

                return res.status(404).send({error: 'No Email Found'});

            } else {

                const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password);

                if (isPasswordCorrect) {

                    return res.status(200).send({ access: auth.createAccessToken(user)});

                } else {

                    return res.status(401).send({ error: 'Email and password do not match' });

                }
            }
        }).catch(findErr => {

            console.error('Error in find: ', findErr);
            return res.status(500).send({ error: 'Error in find' });
        });

    } 
    else {
        return res.status(400).send({error: 'Invalid Email'});
    }
};

module.exports.getProfile = (req, res) => {
return User.findById(req.user.id).then(user => {
    if (user !== null) {
        const { password, ...userInfo } = user["_doc"];
        return res.status(200).send({ user: userInfo });
    } else {
        return res.status(404).send({ error: 'User not found' });
    }
}).catch(profileError => {
    
    console.error('Error fetching user profile: ', profileError);

    return res.status(404).send({ error: 'User not found' })});
};

module.exports.updateUserToAdmin = async (req, res) => {
    const { id: userId } = req.params;

    if (!userId) {
        return res.status(400).send({ message: 'User ID is required' });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        user.isAdmin = true;
        await user.save();

        res.status(200).send({ user });
    } catch (error) {
        res.status(500).send({ error: 'Failed in find', details: error });
    }
};

module.exports.updatePassword = async (req, res) => {
try {
    const { newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });

    res.status(201).send({ message: 'Password reset successfully' });
} catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
}
};