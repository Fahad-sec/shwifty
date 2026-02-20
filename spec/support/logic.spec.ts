import {sanitize }from '../../src/utils/security.ts'

describe("Sanitization check", () => {
   
  it ('should turn brackets into entities', () => {
    expect(sanitize("<div>")).toBe("&lt;div&gt;");

  });

  it ('Alert script should be sanitized', () => {
    const script = "<script>alert('hacker')</script>";
    const result = sanitize(script);

    expect(result).toBe('&lt;script&gt;alert(&#039;hacker&#039;)&lt;/script&gt;');
    expect(result).not.toContain('<script>');
  })

  it ('Check HTML sanitization and text', () => {
    const input = "Hello <b>User</b>";
    expect(sanitize(input)).toBe("Hello &lt;b&gt;User&lt;/b&gt;")
  })
})