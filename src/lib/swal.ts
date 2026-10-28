import Swal, { SweetAlertIcon, SweetAlertOptions } from 'sweetalert2';

// Custom branded SweetAlert2 mixin for CBH Fasteners Platform
const BrandSwal = Swal.mixin({
  customClass: {
    confirmButton: 'swal-btn-confirm',
    cancelButton: 'swal-btn-cancel',
    popup: 'swal-cbh-popup',
    title: 'swal-cbh-title',
    htmlContainer: 'swal-cbh-html',
  },
  buttonsStyling: false,
});

// Toast notification mixin (top-end auto-dismiss)
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

/**
 * Show a branded error modal
 */
export async function showErrorAlert(title: string, message?: string) {
  return BrandSwal.fire({
    icon: 'error',
    title: title || 'Action Failed',
    text: message || 'An unexpected error occurred. Please try again.',
    confirmButtonText: 'Understood',
    confirmButtonColor: '#EF4444',
  });
}

/**
 * Show a branded success modal
 */
export async function showSuccessAlert(title: string, message?: string, timer = 0) {
  const options: SweetAlertOptions = {
    icon: 'success',
    title: title || 'Success',
    text: message || '',
    confirmButtonText: 'Continue',
    confirmButtonColor: '#2563EB',
  };

  if (timer > 0) {
    options.timer = timer;
    options.timerProgressBar = true;
  }

  return BrandSwal.fire(options);
}

/**
 * Show a branded warning modal
 */
export async function showWarningAlert(title: string, message?: string) {
  return BrandSwal.fire({
    icon: 'warning',
    title: title || 'Attention Required',
    text: message || '',
    confirmButtonText: 'Got It',
    confirmButtonColor: '#F59E0B',
  });
}

/**
 * Show a branded info modal
 */
export async function showInfoAlert(title: string, message?: string) {
  return BrandSwal.fire({
    icon: 'info',
    title: title || 'Information',
    text: message || '',
    confirmButtonText: 'Close',
    confirmButtonColor: '#2563EB',
  });
}

/**
 * Show a confirmation dialog (returns true if confirmed, false if cancelled)
 */
export async function showConfirmDialog(
  title: string,
  message: string,
  confirmButtonText = 'Yes, Proceed',
  cancelButtonText = 'Cancel'
): Promise<boolean> {
  const result = await BrandSwal.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
  });

  return result.isConfirmed;
}

/**
 * Show a sleek corner Toast notification
 */
export function showToast(
  title: string,
  icon: SweetAlertIcon = 'success',
  timer = 3000
) {
  Toast.fire({
    icon,
    title,
    timer,
  });
}

/**
 * Show a loading spinner modal (e.g. while processing payments or API calls)
 */
export function showLoadingAlert(title: string, message?: string) {
  BrandSwal.fire({
    title,
    text: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
}

/**
 * Close any currently active SweetAlert2 modal
 */
export function closeAlert() {
  Swal.close();
}

export default BrandSwal;
