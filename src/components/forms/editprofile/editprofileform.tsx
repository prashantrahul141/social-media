import type { FC } from 'react';
import { api } from '@utils/api';
import { useRouter } from 'next/router';
import LoadingComponent from '@components/common/loadingcomponent';
import { useForm } from 'react-hook-form';
import EditProfileUsernameForm from '@components/forms/editprofile/editprofileusernameform';
import type { IEditFormInput } from 'src/types';
import ErrorMessage from '@components/common/errorMessage';
import EditProfileURL from '@components/forms/editprofileurl';
import EditProfileImageForm from '@components/forms/editprofile/editprofileimages';
import EditProfileBannerForm from './editprofilebannerform';

const EditProfileForm: FC = () => {
  const UserData = api.user.getForEdit.useQuery();
  const router = useRouter();
  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IEditFormInput>({ mode: 'all' });

  if (UserData.status !== 'success') {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        <div className='h-8 w-8'>
          <LoadingComponent></LoadingComponent>
        </div>
      </div>
    );
  }

  if (UserData.data === undefined || UserData.data === undefined) {
    void router.push('/404');
    return <></>;
  }

  const submitForm = () => {
    console.log('s');
  };

  return (
    <form className='w-full p-8' onSubmit={handleSubmit(submitForm)}>
      <fieldset className='mb-1'>
        <EditProfileImageForm
          watch={watch}
          register={register}
          currentAvatar={UserData.data.image}></EditProfileImageForm>
        <EditProfileBannerForm
          watch={watch}
          register={register}
          currentBanner={UserData.data.banner}></EditProfileBannerForm>
      </fieldset>

      <fieldset className='mb-4'>
        <input
          type='text'
          title='name'
          className='input mb-1'
          placeholder='Your name here'
          defaultValue={UserData.data.name}
          {...register('name', {
            required: { value: true, message: 'Forgot to type your name?' },
            minLength: {
              value: 2,
              message: 'Name cannot be shorter than 2 characters.',
            },
            maxLength: {
              value: 20,
              message: 'Names cannot be longer than 20 characters.',
            },
          })}
        />

        {errors.name && (
          <ErrorMessage message={errors.name.message}></ErrorMessage>
        )}
      </fieldset>

      <fieldset className='mb-4'>
        <EditProfileUsernameForm
          watch={watch}
          currentUsername={UserData.data.username}
          register={register}></EditProfileUsernameForm>

        {errors.username && errors.username.type !== 'validate' && (
          <ErrorMessage message={errors.username.message}></ErrorMessage>
        )}
      </fieldset>

      <fieldset className='mb-4'>
        <EditProfileURL
          currentUrl={UserData.data.url}
          register={register}></EditProfileURL>
        {errors.url && errors.url.type !== 'validate' && (
          <ErrorMessage message={errors.url.message}></ErrorMessage>
        )}
        {errors.url && errors.url.type === 'validate' && (
          <ErrorMessage message='Not a valid url.'></ErrorMessage>
        )}
      </fieldset>

      <fieldset className='mb-4'>
        <textarea
          title='bio'
          className='textarea mb-1'
          placeholder='About you'
          defaultValue={UserData.data.bio || ''}
          {...register('bio', {
            maxLength: {
              value: 100,
              message: 'People prefer short bio over longer ones!',
            },
          })}
        />
        {errors.bio && (
          <ErrorMessage message={errors.bio.message}></ErrorMessage>
        )}
      </fieldset>

      <button type='submit' className='btn' title='Update Profile'>
        Update Profile
      </button>
    </form>
  );
};

export default EditProfileForm;