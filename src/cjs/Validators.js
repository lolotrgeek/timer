exports.colorValid = color => color && typeof color === 'string' && color.length > 0 && color.charAt(0) === '#' ? true : false
exports.projectValid = project => project && typeof project === 'object' && project.type === 'project' ? true : false
exports.nameValid = name => typeof name === 'string' && name.length > 0 ? true : false