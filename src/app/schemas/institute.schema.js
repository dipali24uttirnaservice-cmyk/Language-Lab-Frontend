import * as Yup from 'yup';

export const adminSchema = Yup.object({
    email: Yup.string()
        .trim()
        .email('Please enter a valid email address')
        .required('Email is required'),

    password: Yup.string().required('Password is required'),
});

export const instituteLoginSchema = Yup.object({
    email: Yup.string()
        .trim()
        .email('Please enter a valid email address')
        .required('Email is required'),
    password: Yup.string().required('Password is required'),
});
