function createHeader() {
    const header = document.getElementsByTagName("header")[0];
    header.innerHTML = `
        <p><a href="${location.protocol}//${location.host}/index.html">Electone技術屋</p>
    `;
}

function createFooter() {
    const header = document.getElementsByTagName("footer")[0];
    header.innerHTML = `
        <p>お問い合わせ：<a href="mailto:kamekyame@outlook.com?subject=Electone技術屋に関する問い合わせ">kamekyame@outlook.com</a></p>
        <p id="copyright">© 2020 Electone Technician</p>
    `;
}

window.onload = () => {
    document.title += " | Electone技術屋";

    createHeader();
    createFooter();
}