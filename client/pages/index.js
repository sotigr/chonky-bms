import React from "react"
 
import { FullFileBrowser, ChonkyActions, defineFileAction } from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';
import Api from '../core/api'
import Router from 'next/router'
import Head from 'next/head'

export default class Index extends React.Component {

    static async getInitialProps(ctx) {
        let path = ctx.query.p || "/"
        let api = new Api()

        let listings = await api.fetchJson('GET', '/api/get-path/?path=' + path)

        return { listings, path }
    }

    state = {
        loaded: false
    }

    

    componentDidMount() {
        this.setState({
            loaded: true
        }) 
    }
 
    render() {
        const deleteAction = defineFileAction({
            id: 'delete',
            button: {
                name: 'Delete',
                // toolbar: true,
                contextMenu: true,
                group: 'Options',
            },
        })
        const folderAction = defineFileAction({
            id: 'new_folder',
            button: {
                name: 'New Folder',
                toolbar: true,
                contextMenu: true,
                group: 'Options',
            },
        })
        const urlAction = defineFileAction({
            id: 'new_url',
            button: {
                name: 'New Url',
                toolbar: true,
                contextMenu: true,
                group: 'Options',
            },
        })

        const folderChain = [
            {
                id: "0",
                name: "Home",
                openable: true,
                path: "/"
            },
            {
                id: "1",
                name: this.props.path,
                openable: false
            }
        ]


        this.props.path.split("/").map((p, i) => {
            return {
                id: i,
                name: p,
                openable: true
            }
        })

        let files = this.props.listings.subDirs.map(i => {
            return {
                id: i._id,
                name: i.path.replace(this.props.path, "").replace("/", ""),
                isDir: true,
                path: i.path
            }
        }).concat(this.props.listings.urls.map(u => {
            return {
                id: u._id,
                name: u.title + ".url",
                modDate: u.createdAt,
                url: u.url
            }
        }))

        return (
            <> 
                <Head>
                    <meta name="viewport" content="maximum-scale=1.5, minimum-scale=1.0, initial-scale=1.0, width=device-width" />
                </Head>
                {
                    this.state.loaded && (

                        <div style={{ height: "100vh", width: "100vw" }}>
                            <FullFileBrowser
                                darkMode
                                disableDefaultFileActions={true}
                                // defaultFileViewActionId={ChonkyActions.EnableListView.id}
                                iconComponent={ChonkyIconFA}
                                folderChain={folderChain}
                                files={files}
                                fileActions={[
                                    deleteAction,
                                    folderAction,
                                    urlAction,
                                    // ChonkyActions.EnableListView,
                                    // ChonkyActions.EnableGridView,
                                ]}
                                onFileAction={async (e) => {
                                    if (e.id == "mouse_click_file") {
                                        if (e.payload.file.isDir) {
                                            Router.push("/?p=" + e.payload.file.path)
                                        } else {
                                            this.link = document.createElement("a");
                                            this.link.href = e.payload.file.url;
                                            this.link.target = "_blank";
                                            this.link.click();
                                            delete this.link;
                                        }
                                    } else if (e.id == "open_files") {
                                        Router.push("/?p=" + e.payload.targetFile.path)
                                    } else if (e.id == "delete" && e.state.selectedFilesForAction.length > 0) {
                                        if (confirm("DELETE! Are you sure?")) {
                                            let api = new Api()
                                            await api.fetchJson('GET', '/api/delete-url/?id=' + e.state.selectedFilesForAction[0].id)
                                            Router.replace(Router.asPath)
                                        }
                                    } else if (e.id == "new_url") {
                                        let url = prompt("Enter url", "");
                                        if (url) {
                                            let api = new Api()

                                            await api.fetchJson('POST', '/api/new-url/', {
                                                path: this.props.path,
                                                url: url
                                            })
                                            Router.replace(Router.asPath)
                                        }
                                    } else if (e.id == "new_folder") {
                                        let folderName = prompt("Enter folder name", "");
                                        if (folderName) {
                                            if (this.props.path.endsWith("/")) {

                                                Router.push("/?p=" + this.props.path + folderName)
                                            } else {
                                                Router.push("/?p=" + this.props.path + "/" + folderName)

                                            }
                                        }
                                    }
 
                                }}
                            />

                        </div>
                    )
                }
            </>
        )
    }
}