import { type IconProps, generateClassesForIcon } from "./Icon";

/**
 * @usage <IconForm />
 */
export const IconForm = (props: IconProps) => {
  const classes = generateClassesForIcon(props);
  return (
    <svg
      className={classes}
      viewBox="0 0 22 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.426 11.8593C13.4506 12.0493 13.636 13.9588 13.6645 14.2873C13.7007 14.7027 14.0091 15.0566 14.4338 15.0566C14.6378 15.0566 14.8335 14.9756 14.9778 14.8313C15.1221 14.687 15.2031 14.4913 15.2031 14.2873C15.2031 13.848 15.1139 13.0025 15.0331 12.3178C14.8754 10.9853 14.69 9.6813 14.2738 8.4019C13.793 6.92478 12.9275 5.03299 11.3835 3.48894C8.35698 0.462379 3.95803 0.0153963 3.84648 0.0038563C3.70502 -0.0103251 3.56238 0.014774 3.43426 0.0763944C3.30613 0.138015 3.19748 0.23377 3.12024 0.353134C2.35785 1.49944 2.54556 3.20736 3.47951 4.20519C3.46937 4.30068 3.4772 4.39723 3.50259 4.48984C3.65524 5.05049 3.84807 5.59942 4.07958 6.13237C4.50347 7.10403 5.10123 8.08647 5.94363 8.92966C7.52073 10.5068 9.59173 11.2307 11.2088 11.5685C11.9398 11.7209 12.6804 11.8181 13.426 11.8593Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.9029 5.4166L11.2653 4.64407C10.9655 5.93318 10.3409 8.48663 9.51436 11.0982C9.08284 10.9459 8.64312 10.7632 8.20799 10.5436C9.28604 7.11073 10.0188 3.76887 10.0782 3.49776C10.0807 3.48634 10.082 3.48037 10.0821 3.48007C10.1047 3.37629 10.1503 3.27893 10.2157 3.1952C10.281 3.11147 10.3643 3.04352 10.4595 2.99638C10.5547 2.94924 10.6592 2.92412 10.7654 2.92288C10.7664 2.92287 10.7675 2.92286 10.7685 2.92285C10.9784 3.10066 11.184 3.28908 11.3837 3.48871C11.9882 4.09329 12.4888 4.75117 12.9029 5.4166ZM9.2776 11.8304C8.84828 11.6797 8.40872 11.4998 7.97056 11.2847C7.59969 12.4169 7.19221 13.5258 6.76865 14.5123L8.04957 15.117C8.48834 14.0986 8.90109 12.9697 9.2776 11.8304ZM14.1058 5.98406C13.7221 5.23276 13.2411 4.46077 12.6386 3.72876L21.0456 7.69986L21.0479 7.7014C21.1921 7.76868 21.3091 7.88306 21.3796 8.0257C21.45 8.16834 21.4698 8.33073 21.4357 8.48612C21.4347 8.4882 21.4257 8.52837 21.409 8.60283C21.1785 9.63159 19.4812 17.2058 17.3291 21.2878C16.5282 22.7165 15.7743 23.9097 14.3918 23.9997C13.8171 23.9928 13.3263 23.8451 12.894 23.6181L12.8893 23.6274L2.92207 18.9114C1.81503 18.329 1.13418 17.1765 0.732599 16.161C0.190459 14.8006 0.0300268 13.4962 0.00692601 13.3084C0.00537559 13.2958 0.00444377 13.2882 0.00405669 13.286C-0.00936019 13.1612 0.0106415 13.0351 0.062012 12.9206C0.113382 12.8061 0.194274 12.7073 0.296397 12.6344C0.399116 12.5621 0.519153 12.5183 0.644288 12.5075C0.769424 12.4967 0.89519 12.5192 1.00878 12.5728L10.9791 17.2811C11.0888 17.332 11.1833 17.4106 11.2535 17.509C11.3236 17.6075 11.3669 17.7225 11.3792 17.8428C11.3796 17.8428 11.3812 17.8549 11.3843 17.8782C11.3964 17.9704 11.4313 18.2372 11.51 18.6167C11.6288 19.206 11.7979 19.7841 12.0154 20.3446C12.5324 21.6186 13.3001 22.6126 14.3926 22.5895C14.5764 22.6803 15.3981 22.0033 16.0828 20.6262C16.7905 19.2914 17.4814 17.4473 18.0714 15.6009C18.9846 12.7513 19.667 9.89708 19.9332 8.73308L14.1058 5.98406Z"
      />
    </svg>
  );
};