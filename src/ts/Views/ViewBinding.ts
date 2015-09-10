interface ViewBinding {
    selector: string,
    event: string,
    listener: (event: Event) => void
}

export = ViewBinding;