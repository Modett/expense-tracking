export class Receipt {
  private constructor(private readonly value: string | null) {
    if (value !== null) {
      if (value.trim().length === 0) {
        throw new Error("Receipt URL cannot be empty string, use null instead");
      }

      try {
        const url = new URL(value);

        if (url.protocol !== "http:" && url.protocol !== "https:") {
          throw new Error("Receipt URL must use HTTP or HTTPS protocol");
        }

        if (value.length > 2000) {
          throw new Error("Receipt URL cannot exceed 2000 characters");
        }

        const allowedExtensions = [
          ".pdf",
          ".jpg",
          ".jpeg",
          ".png",
          ".gif",
          ".bmp",
          ".tiff",
          ".webp",
        ];
        const pathname = url.pathname.toLowerCase();
        const hasValidExtension =
          allowedExtensions.some((ext) => pathname.endsWith(ext)) ||
          pathname.includes("/") ||
          pathname === "";

        if (
          !hasValidExtension &&
          !pathname.includes("upload") &&
          !pathname.includes("file")
        ) {
          console.warn(`Receipt URL might not point to a valid file: ${value}`);
        }
      } catch (error) {
        if (error instanceof TypeError) {
          throw new Error(`Invalid receipt URL format: ${value}`);
        }
        throw error;
      }
    }
  }

  static create(url?: string): Receipt {
    if (!url || url.trim().length === 0) {
      return new Receipt(null);
    }
    return new Receipt(url.trim());
  }

  static fromString(value: string | null): Receipt {
    if (value === null) {
      return new Receipt(null);
    }
    return new Receipt(value);
  }

  static empty(): Receipt {
    return new Receipt(null);
  }

  getValue(): string | null {
    return this.value;
  }

  isEmpty(): boolean {
    return this.value === null;
  }

  hasReceipt(): boolean {
    return this.value !== null;
  }

  equals(other: Receipt): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value || "";
  }

  getFileExtension(): string | null {
    if (!this.value) return null;

    try {
      const url = new URL(this.value);
      const pathname = url.pathname;
      const lastDotIndex = pathname.lastIndexOf(".");

      if (lastDotIndex === -1 || lastDotIndex === pathname.length - 1) {
        return null;
      }

      return pathname.substring(lastDotIndex).toLowerCase();
    } catch {
      return null;
    }
  }

  isImageFile(): boolean {
    const extension = this.getFileExtension();
    if (!extension) return false;

    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".tiff",
      ".webp",
    ];
    return imageExtensions.includes(extension);
  }

  isPdfFile(): boolean {
    const extension = this.getFileExtension();
    return extension === ".pdf";
  }

  getHostname(): string | null {
    if (!this.value) return null;

    try {
      const url = new URL(this.value);
      return url.hostname;
    } catch {
      return null;
    }
  }

  isSecureUrl(): boolean {
    if (!this.value) return false;

    try {
      const url = new URL(this.value);
      return url.protocol === "https:";
    } catch {
      return false;
    }
  }

  getDisplayName(): string {
    if (!this.value) return "No receipt";

    try {
      const url = new URL(this.value);
      const pathname = url.pathname;
      const filename = pathname.split("/").pop();

      if (filename && filename.length > 0) {
        return filename;
      }

      return `${url.hostname}${pathname}`;
    } catch {
      return this.value.length > 50
        ? this.value.substring(0, 47) + "..."
        : this.value;
    }
  }
}
